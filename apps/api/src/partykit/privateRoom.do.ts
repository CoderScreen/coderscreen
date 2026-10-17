import { Id } from '@coderscreen/common/id';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import { eq, sql } from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Connection } from 'partyserver';
import postgres from 'postgres';
import { YServer } from 'y-partyserver';
import * as Y from 'yjs';
import { AppContext } from '@/index';
import { coalesce, DocStore, rememberServerName } from './internal/docStore';
import { persistWithRetry } from './internal/persist';

// How often live notes are copied to Postgres while someone edits. Every edit
// is already saved to the Durable Object's own storage.
const EXPORT_INTERVAL_MS = 5 * 60 * 1000;

export class PrivateRoomServer extends YServer<AppContext['Bindings']> {
  private db: PostgresJsDatabase | null = null;

  private room: RoomEntity | null = null;
  private docStore: DocStore | null = null;
  private lastExportAt = 0;
  private purged = false;
  private exportSnapshot = coalesce(() => this.exportToPostgres());

  // Hibernate between messages so open notes tabs aren't billed for wall-clock
  // time. onLoad runs again after each wake, so anything needed across
  // messages lives in storage. Pending timers (the save debounce) keep the
  // object awake, so unsaved notes are never dropped.
  static options = { hibernate: true };

  /* control how often the onSave handler
   * is called with these options */
  static callbackOptions = {
    // all of these are optional
    debounceWait: /* number, default = */ 5000,
    debounceMaxWait: /* number, default = */ 10000,
    timeout: /* number, default = */ 10000,
  };

  async onLoad() {
    // when first started, fetch the details of the room associated with this room
    const roomId = this.name as Id<'room'>;
    const room = await this.getDb()
      .select()
      .from(roomTable)
      .where(eq(roomTable.id, roomId))
      .then((res) => res[0] ?? null);

    if (!room) {
      // The room was deleted, so drop this object's copy of the notes too.
      await this.ctx.storage.deleteAll();
      throw new Error('Room not found');
    }

    this.room = room;
    this.docStore = new DocStore(this.ctx.storage, { party: 'private-room', roomId });
    await rememberServerName(this.ctx.storage, roomId);

    await this.loadDocument(roomId);
    // Never exported means the first save exports right away.
    this.lastExportAt = (await this.getDocStore().lastExportedAt()) ?? 0;
  }

  /**
   * Load order: this object's own storage, then the Postgres copy (notes last
   * saved before live state moved into Durable Object storage).
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
      .select({ rawPrivateContent: roomContentTable.rawPrivateContent })
      .from(roomContentTable)
      .where(eq(roomContentTable.roomId, roomId))
      .then((res) => res[0]?.rawPrivateContent);

    // Empty until the first notes save (the shared room creates the row), and
    // applying an empty update throws.
    if (legacyContent) {
      Y.applyUpdate(this.document, new Uint8Array(Buffer.from(legacyContent, 'base64')));
      // Postgres already holds these notes, so they start out exported.
      await docStore.markExported(await docStore.save(this.document));
    }
  }

  async onSave() {
    // Called a few seconds after edits. The local save is what keeps the notes;
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
      // Export failures are already reported by persistWithRetry. The notes
      // are safe locally, so retry the export later by alarm.
      console.error(`[private-room] failed to persist ${this.room?.id}:`, err);
      await this.docStore?.scheduleExportRetry().catch(() => {});
    }
  }

  /**
   * Called when the room is deleted: disconnect everyone and drop the stored
   * notes so they stop being billed.
   */
  async purge() {
    this.purged = true;
    for (const connection of this.getConnections()) {
      connection.close(1000, 'Room deleted');
    }
    await this.ctx.storage.deleteAll();
  }

  /**
   * Copy the notes to Postgres in the format used before live state moved into
   * Durable Object storage, so older code and the legacy load path keep working.
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
    const totalContent = Y.encodeStateAsUpdate(this.document);

    const roomContent: RoomContentEntity = {
      roomId: room.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: room.userId,
      organizationId: room.organizationId,
      code: '',
      language: room.language,
      instructions: [],
      executionHistory: [],
      rawContent: '',
      rawPrivateContent: Buffer.from(totalContent).toString('base64'),
      status: 'active',
      trackedUsers: [],
    };

    await persistWithRetry({
      party: 'private-room',
      roomId: room.id,
      payloadBytes: roomContent.rawPrivateContent.length,
      write: () =>
        db
          .insert(roomContentTable)
          .values(roomContent)
          .onConflictDoUpdate({
            target: [roomContentTable.roomId],
            set: {
              updatedAt: new Date().toISOString(),
              rawPrivateContent: sql.raw(`excluded."${roomContentTable.rawPrivateContent.name}"`),
            },
          }),
    });

    await docStore.markExported(revision);
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

  private getRoom() {
    if (!this.room) {
      throw new Error('Room not found');
    }

    return this.room;
  }

  private getDocStore() {
    if (!this.docStore) {
      throw new Error('Document store not initialized');
    }

    return this.docStore;
  }
}
