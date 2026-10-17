import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import { eq, sql } from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Connection, ConnectionContext } from 'partyserver';
import postgres from 'postgres';
import { YServer } from 'y-partyserver';
import * as Y from 'yjs';
import { AppContext } from '@/index';
import { getSandboxId } from '@/lib/sandbox';
import { getWorkspaceTemplate } from '@/lib/templates/languageTemplate';
import { FileSyncService } from '@/sandbox/FileSyncService';
import { AIService, ChatMessage, User } from './internal/AI.service';
import { coalesce, DocStore, rememberServerName } from './internal/docStore';
import { persistWithRetry } from './internal/persist';
import { SandboxService } from './internal/Sandbox.service';

const KEYS = {
  trackedUsers: 'tracked-users',
};

// File system constants
const FS_MAP_KEY = 'fs';

// How often a live room copies its document to Postgres while people edit.
// Every edit is already saved to the Durable Object's own storage.
const EXPORT_INTERVAL_MS = 5 * 60 * 1000;

// Helper function to generate unique ID for files and folders
const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get file key for Y.Text
const getFileKey = (fileId: string) => `file:${fileId}`;

// File system entry interface
interface FSEntry {
  type: 'file' | 'folder';
  name: string;
  parentId: string | null;
  children?: string[];
}

// Helper function to create a file entry
const createFileEntry = (name: string, parentId: string | null): FSEntry => ({
  type: 'file',
  name,
  parentId,
});

// Helper function to create a folder entry
const createFolderEntry = (
  name: string,
  parentId: string | null,
  children: string[] = []
): FSEntry => ({
  type: 'folder',
  name,
  parentId,
  children,
});

// Helper function to find an item by path
const findItemByPath = (
  fsMap: Y.Map<FSEntry>,
  path: string
): { id: string; entry: FSEntry } | null => {
  if (!path) return null;

  const pathParts = path.split('/').filter((part) => part.length > 0);
  if (pathParts.length === 0) return null;

  // Find root items (items with no parent)
  const rootItems: string[] = [];
  fsMap.forEach((entry, id) => {
    if (!entry.parentId) {
      rootItems.push(id);
    }
  });

  // Walk down the tree following the path
  let currentId: string | null = null;
  let currentEntry: FSEntry | null = null;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];

    if (i === 0) {
      // Look for root item
      for (const rootId of rootItems) {
        const entry = fsMap.get(rootId);
        if (entry && entry.name === part) {
          currentId = rootId;
          currentEntry = entry;
          break;
        }
      }
    } else {
      // Look for child item
      if (!currentEntry || currentEntry.type !== 'folder' || !currentEntry.children) {
        return null;
      }

      let found = false;
      for (const childId of currentEntry.children) {
        const childEntry = fsMap.get(childId);
        if (childEntry && childEntry.name === part) {
          currentId = childId;
          currentEntry = childEntry;
          found = true;
          break;
        }
      }

      if (!found) {
        return null;
      }
    }
  }

  return currentId && currentEntry ? { id: currentId, entry: currentEntry } : null;
};

// Helper function to add an item to its parent's children list
const addItemToParentById = (fsMap: Y.Map<FSEntry>, itemId: string, parentId: string | null) => {
  if (!parentId) return; // Root item, no parent to update

  const parentEntry = fsMap.get(parentId);
  if (parentEntry && parentEntry.type === 'folder') {
    const children = parentEntry.children || [];
    if (!children.includes(itemId)) {
      children.push(itemId);
      fsMap.set(parentId, { ...parentEntry, children });
    }
  }
};

export class RoomServer extends YServer<AppContext['Bindings']> {
  private db: PostgresJsDatabase | null = null;
  private sandboxService: SandboxService;
  private aiService: AIService | null = null;
  private fileSyncService: FileSyncService | null = null;
  private room: RoomEntity | null = null;
  private trackedUserIds: Set<string> = new Set();
  private docStore: DocStore | null = null;
  private lastExportAt = 0;
  private purged = false;
  private sandboxPrepared = false;
  private exportSnapshot = coalesce(() => this.exportToPostgres());

  // Hibernate between messages so idle rooms (and tabs left open) aren't billed
  // for wall-clock time. The object is unloaded after ~10s without activity and
  // onLoad runs again on the next message, so nothing needed across messages
  // may live only in memory. Pending timers (the save debounce) keep it awake,
  // so unsaved edits are never dropped.
  static options = { hibernate: true };

  /* control how often the onSave handler
   * is called with these options */
  static callbackOptions = {
    // all of these are optional
    debounceWait: /* number, default = */ 5000,
    debounceMaxWait: /* number, default = */ 10000,
    timeout: /* number, default = */ 10000,
  };

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.sandboxService = new SandboxService(env);
  }

  async onLoad() {
    this.sandboxService = new SandboxService(this.env);

    // when first started, fetch the details of the room associated with this room
    const roomId = this.name as Id<'room'>;
    const room = await this.getDb()
      .select()
      .from(roomTable)
      .where(eq(roomTable.id, roomId))
      .then((res) => res[0] ?? null);

    if (!room) {
      // The room was deleted, so drop this object's copy of the document too.
      await this.ctx.storage.deleteAll();
      throw new Error('Room not found');
    }

    this.room = room;
    this.aiService = new AIService(this.env, this.document, this.room);
    this.docStore = new DocStore(this.ctx.storage, { party: 'room', roomId });
    await rememberServerName(this.ctx.storage, roomId);

    await this.loadDocument(roomId);
    // Never exported means the first save exports right away.
    this.lastExportAt = (await this.getDocStore().lastExportedAt()) ?? 0;

    // Users already recorded in the doc, so a wake doesn't record them again.
    for (const user of this.document.getArray<User>(KEYS.trackedUsers).toArray()) {
      this.trackedUserIds.add(user.id);
    }

    // Mirror edits to the sandbox filesystem. Observing is free; writing every
    // file and warming the container waits until someone is connected (see
    // prepareSandbox), since onLoad also runs for alarms.
    const sandbox = getSandbox(this.env.SANDBOX, getSandboxId(roomId), { normalizeId: true });
    this.fileSyncService = new FileSyncService(sandbox, this.document);
    this.fileSyncService.startObserving();

    // Woken from hibernation with people still connected.
    const [connected] = this.getConnections();
    if (connected) {
      this.prepareSandbox();
    }

    this.document.awareness.on(
      'change',
      ({ added }: { added: number[]; updated: number[]; removed: number[] }) => {
        const addedUsers = added.map((id) => {
          const state = this.document.awareness.getStates().get(id) as { user: User } | undefined;
          return state?.user;
        });
        this.handleUserJoin(addedUsers);
      }
    );
  }

  onConnect(connection: Connection, ctx: ConnectionContext) {
    super.onConnect(connection, ctx);
    this.prepareSandbox();
  }

  /**
   * Warm the container and write every file to it, once per load of this
   * object and only while someone is connected. Ended rooms are read-only, so
   * they don't need a sandbox at all.
   */
  private prepareSandbox() {
    if (this.sandboxPrepared || this.getRoom().status === 'completed') {
      return;
    }
    this.sandboxPrepared = true;

    this.createNewSandbox();
    if (this.fileSyncService) {
      this.ctx.waitUntil(this.fileSyncService.syncAllFiles());
    }
  }

  /**
   * Load order: this object's own storage, then the Postgres copy (rooms last
   * saved before live state moved into Durable Object storage), then a fresh
   * workspace.
   */
  private async loadDocument(roomId: Id<'room'>) {
    const docStore = this.getDocStore();

    if (await docStore.load(this.document)) {
      // An earlier export failed or never ran (e.g. the object was evicted).
      // Hibernation reloads the room often, so only catch up once the export
      // interval has passed.
      const exportedAt = (await docStore.lastExportedAt()) ?? 0;
      if (
        (await docStore.hasUnexportedChanges()) &&
        Date.now() - exportedAt >= EXPORT_INTERVAL_MS
      ) {
        this.exportInBackground();
      }
      return;
    }

    const legacyContent = await this.getDb()
      .select({ rawContent: roomContentTable.rawContent })
      .from(roomContentTable)
      .where(eq(roomContentTable.roomId, roomId))
      .then((res) => res[0]?.rawContent);

    // The row can exist with an empty doc when the private (notes) room saved
    // first, and applying an empty update throws.
    if (legacyContent) {
      Y.applyUpdate(this.document, new Uint8Array(Buffer.from(legacyContent, 'base64')));
      // Postgres already holds this state, so it starts out exported.
      await docStore.markExported(await docStore.save(this.document));
      return;
    }

    await this.initializeDefaultValues();
    // y-partyserver only saves edits made after onLoad. Save the starter
    // workspace now, or it is lost if the room restarts before anyone types.
    await docStore.save(this.document);
  }

  private async initializeDefaultValues() {
    const isInitialized = await this.ctx.storage.get<boolean>('initialized');
    if (isInitialized) {
      return;
    }

    /**
     * need to set default values for:
     * - language
     * - status
     * - file system map
     * - file content
     * rest will be created by user
     */
    const room = this.getRoom();
    const langValue = this.document.getText('language');
    const statusValue = this.document.getText('status');
    langValue.delete(0, langValue.length);
    statusValue.delete(0, statusValue.length);
    langValue.insert(0, room.language);
    statusValue.insert(0, room.status);

    // Initialize file system
    this.initializeFileSystem(room.language);

    // services init themselves
    this.aiService?.initialize();

    this.ctx.storage.put('initialized', true);
  }

  private initializeFileSystem(language: RoomEntity['language']) {
    // Get the file system map
    const fsMap = this.document.getMap<FSEntry>(FS_MAP_KEY);

    // Clear any existing entries
    fsMap.clear();

    // Get workspace template for the language
    const template = getWorkspaceTemplate(language);

    // Create file and folder entries from template
    template.forEach((file) => {
      if (file.isFolder) {
        this.createFolder(file.path);
      } else {
        this.createFile(file.path, file.code);
      }
    });
  }

  private createFolder(path: string) {
    const fsMap = this.document.getMap<FSEntry>(FS_MAP_KEY);

    // Generate unique ID for the folder
    const folderId = generateId();

    // Parse the path to get name and parent
    const pathParts = path.split('/');
    const folderName = pathParts.pop() || '';
    const parentPath = pathParts.join('/');
    const parentResult = parentPath ? findItemByPath(fsMap, parentPath) : null;
    const parentId = parentResult?.entry.type === 'folder' ? parentResult.id : null;

    // Create folder entry
    const folderEntry = createFolderEntry(folderName, parentId);
    fsMap.set(folderId, folderEntry);

    // Add to parent folder if it exists
    if (parentId) {
      addItemToParentById(fsMap, folderId, parentId);
    }
  }

  private createFile(path: string, content: string) {
    const fsMap = this.document.getMap<FSEntry>(FS_MAP_KEY);

    // Generate unique ID for the file
    const fileId = generateId();

    // Parse the path to get name and parent
    const pathParts = path.split('/');
    const fileName = pathParts.pop() || '';
    const parentPath = pathParts.join('/');
    const parentResult = parentPath ? findItemByPath(fsMap, parentPath) : null;
    const parentId = parentResult?.entry.type === 'folder' ? parentResult.id : null;

    // Create file entry
    const fileEntry = createFileEntry(fileName, parentId);
    fsMap.set(fileId, fileEntry);

    // Add to parent folder if it exists
    if (parentId) {
      addItemToParentById(fsMap, fileId, parentId);
    }

    // Create Y.Text for file content
    const ytext = this.document.getText(getFileKey(fileId));
    ytext.insert(0, content);
  }

  async onSave() {
    // Called a few seconds after edits. The local save is what keeps the work;
    // Postgres gets a copy every EXPORT_INTERVAL_MS and when the room empties.
    if (this.purged) {
      return;
    }

    await this.getDocStore().save(this.document);

    if (Date.now() - this.lastExportAt >= EXPORT_INTERVAL_MS) {
      this.exportInBackground();
    }
  }

  private exportInBackground() {
    this.ctx.waitUntil(this.exportSnapshot().catch(() => this.getDocStore().scheduleExportRetry()));
  }

  /** Retry for an export that failed (see DocStore.scheduleExportRetry). */
  async onAlarm() {
    if (this.purged || !(await this.getDocStore().hasUnexportedChanges())) {
      return;
    }
    await this.exportSnapshot().catch(() => this.getDocStore().scheduleExportRetry());
  }

  onClose(connection: Connection, code: number, reason: string, wasClean: boolean) {
    super.onClose(connection, code, reason, wasClean);

    // Closed sockets are no longer listed, so this is empty once the last
    // person leaves.
    const [stillConnected] = this.getConnections();
    if (!stillConnected) {
      this.ctx.waitUntil(this.persistNow());
    }
  }

  /** Save locally and copy to Postgres right away. Never throws. */
  private async persistNow() {
    if (this.purged) {
      return;
    }

    try {
      await this.getDocStore().save(this.document);
      await this.exportSnapshot();
    } catch (err) {
      // Export failures are already reported by persistWithRetry. The document
      // is safe locally, so retry the export later by alarm.
      console.error(`[room] failed to persist ${this.room?.id}:`, err);
      await this.docStore?.scheduleExportRetry().catch(() => {});
    }
  }

  /**
   * Called when the room is deleted: disconnect everyone and drop the stored
   * document so it stops being billed.
   */
  async purge() {
    this.purged = true;
    for (const connection of this.getConnections()) {
      connection.close(1000, 'Room deleted');
    }
    await this.ctx.storage.deleteAll();
  }

  /**
   * Copy the document to Postgres in the format rooms used before live state
   * moved into Durable Object storage, so older code and the legacy load path
   * keep working.
   */
  private async exportToPostgres() {
    if (this.purged) {
      return;
    }

    this.lastExportAt = Date.now();
    const docStore = this.getDocStore();
    const revision = await docStore.currentRevision();

    const db = this.getDb();
    const room = this.getRoom();

    const rawCodeValue = this.document.getText('code');
    const codeValue = rawCodeValue.toJSON();

    const rawInstructionsValue = this.document.getXmlFragment('instructions');
    const instructionsValue = rawInstructionsValue.toArray();

    const rawExecutionHistoryValue = this.document.getArray('executionHistory');
    const executionHistoryValue = rawExecutionHistoryValue.toArray();

    const languageValue = this.document.getText('language');
    const language = languageValue.toJSON();

    const statusValue = this.document.getText('status');
    const status = statusValue.toJSON() as RoomEntity['status'];

    const trackedUsersValue = this.document.getArray<User>(KEYS.trackedUsers);
    const trackedUsers = trackedUsersValue.toArray();

    const totalContent = Y.encodeStateAsUpdate(this.document);
    const roomContent: RoomContentEntity = {
      roomId: room.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: room.userId,
      organizationId: room.organizationId,
      code: codeValue,
      language,
      instructions: instructionsValue,
      executionHistory: executionHistoryValue,
      rawContent: Buffer.from(totalContent).toString('base64'),
      rawPrivateContent: '',
      status,
      trackedUsers,
    };

    // Reference the inserted row (`excluded`) in the conflict update so the
    // document is sent once, not twice. Large statements fail to send from the
    // Worker, and every save after the first failure fails too because the doc
    // only grows.
    const excluded = (column: { name: string }) => sql.raw(`excluded."${column.name}"`);
    await persistWithRetry({
      party: 'room',
      roomId: room.id,
      payloadBytes: JSON.stringify(roomContent).length,
      write: () =>
        db
          .insert(roomContentTable)
          .values(roomContent)
          .onConflictDoUpdate({
            target: [roomContentTable.roomId],
            set: {
              status: excluded(roomContentTable.status),
              code: excluded(roomContentTable.code),
              language: excluded(roomContentTable.language),
              instructions: excluded(roomContentTable.instructions),
              executionHistory: excluded(roomContentTable.executionHistory),
              trackedUsers: excluded(roomContentTable.trackedUsers),
              rawContent: excluded(roomContentTable.rawContent),
            },
          }),
    });

    // Only bump the room after the content landed, so `updated_at` reflects
    // the last successful save instead of hiding failed ones.
    await db
      .update(roomTable)
      .set({
        language: language as RoomEntity['language'],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(roomTable.id, room.id));

    await docStore.markExported(revision);
  }

  /**
   * Re-write the current Y.Doc workspace to the sandbox filesystem.
   *
   * The sandbox container is ephemeral (`SandboxDO.sleepAfter`), so it can be
   * evicted mid-interview and lose everything under `/workspace`. `syncAllFiles`
   * only runs once in `onLoad`, and `startObserving` only writes on subsequent
   * edits — so a candidate who clicks "Run" after the container was reclaimed
   * (without typing since) hits a missing file and execution fails. Calling this
   * right before a run guarantees the entry file is present. For single-file
   * languages (the only ones with a Run button) this is a single writeFile.
   */
  async ensureWorkspaceSynced(): Promise<void> {
    if (!this.fileSyncService) {
      const sandbox = getSandbox(this.env.SANDBOX, getSandboxId(this.name as Id<'room'>), {
        normalizeId: true,
      });
      this.fileSyncService = new FileSyncService(sandbox, this.document);
      this.fileSyncService.startObserving();
    }

    await this.fileSyncService.syncAllFiles();
  }

  async handleStatusUpdate(status: RoomEntity['status']) {
    this.document.transact(() => {
      const statusText = this.document.getText('status');
      statusText.delete(0, statusText.length);
      statusText.insert(0, status);
    });

    // we can just update local state, the db remains source of truth
    if (this.room) {
      this.room.status = status;
      this.room.updatedAt = new Date().toISOString();
    }

    // Ending the interview should leave the final state in Postgres.
    await this.persistNow();
  }

  private getDb() {
    if (!this.db) {
      // Only used on load and for exports now, so keep one connection and
      // release it when idle instead of holding it for the object's lifetime.
      const sql = postgres(this.env.INFISCAL_DATABASE_URL, { max: 1, idle_timeout: 20 });
      this.db = drizzle(sql);
    }

    return this.db;
  }

  private getDocStore() {
    if (!this.docStore) {
      throw new Error('Document store not initialized');
    }

    return this.docStore;
  }

  private getRoom() {
    if (!this.room) {
      throw new Error('Room not found');
    }

    return this.room;
  }

  private getSandbox() {
    if (!this.sandboxService) {
      throw new Error('Sandbox service not found');
    }

    return this.sandboxService;
  }

  private createNewSandbox() {
    const room = this.getRoom();
    const roomId = room.id;

    this.ctx.waitUntil(this.getSandbox().startSandbox({ roomId }));
  }

  // AI Chat Methods
  async handleAiChat(params: {
    userMessage: ChatMessage & { user: User };
    assistantMessage: ChatMessage;
  }) {
    if (!this.aiService) {
      throw new Error('AI service not found');
    }

    // Start streaming AI response
    const messages = await this.aiService.streamResponse(params);

    this.ctx.waitUntil(this.aiService.onComplete(messages));
  }

  private async handleUserJoin(user: (User | undefined)[]) {
    const filteredUsers = user.filter(
      (user) => user !== undefined && !this.trackedUserIds.has(user.id)
    ) as User[];

    if (filteredUsers.length === 0) {
      return;
    }

    const trackedUsers = this.document.getArray<User>(KEYS.trackedUsers);
    // track every joined user in y.js doc
    trackedUsers.push(filteredUsers);

    filteredUsers.forEach((user) => {
      this.trackedUserIds.add(user.id);
    });
  }
}
