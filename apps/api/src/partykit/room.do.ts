import { Id } from '@coderscreen/common/id';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import { eq } from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { YServer } from 'y-partyserver';
import * as Y from 'yjs';
import { AppContext } from '@/index';
import { getWorkspaceTemplate } from '@/lib/templates/languageTemplate';
import { AIService, ChatMessage, User } from './internal/AI.service';
import { SandboxService } from './internal/Sandbox.service';

const KEYS = {
  trackedUsers: 'tracked-users',
};

// File system constants
const FS_MAP_KEY = 'fs';
const FILE_CHANGE_COUNTER_KEY = '__fileChangeCounter';

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
  private room: RoomEntity | null = null;
  private trackedUserIds: Set<string> = new Set();

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
    const db = this.getDb();
    const data = await db
      .select({
        room: roomTable,
        roomContent: roomContentTable,
      })
      .from(roomTable)
      .where(eq(roomTable.id, roomId))
      .leftJoin(roomContentTable, eq(roomContentTable.roomId, roomTable.id))
      .then((res) => (res.length > 0 ? res[0] : null));

    if (!data) {
      throw new Error('Room not found');
    }

    this.room = data.room;
    this.aiService = new AIService(this.env, this.document, this.room);

    if (data.roomContent) {
      Y.applyUpdate(
        this.document,
        new Uint8Array(Buffer.from(data.roomContent.rawContent, 'base64'))
      );
    } else {
      this.initializeDefaultValues();
    }

    // warm up the sandbox
    this.createNewSandbox();

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

    // Initialize file change counter
    const counterMap = this.document.getMap(FILE_CHANGE_COUNTER_KEY);
    counterMap.set('value', 0);

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
    // called every few seconds after edits, and when the room empties
    // you can use this to write to a database or some external storage

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

    await Promise.all([
      db
        .insert(roomContentTable)
        .values(roomContent)
        .onConflictDoUpdate({
          target: [roomContentTable.roomId],
          set: {
            ...roomContent,
            roomId: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            userId: undefined,
            organizationId: undefined,
            rawPrivateContent: undefined,
          },
        }),
      db
        .update(roomTable)
        .set({
          language: language as RoomEntity['language'],
          updatedAt: new Date().toISOString(),
        })
        .where(eq(roomTable.id, room.id)),
    ]);
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
  }

  private getDb() {
    if (!this.db) {
      const sql = postgres(this.env.INFISCAL_DATABASE_URL);
      this.db = drizzle(sql);
    }

    return this.db;
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
