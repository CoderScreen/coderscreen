import { AppContext } from '@/index';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { YServer } from 'y-partyserver';
import { Id } from '@coderscreen/common/id';
import * as Y from 'yjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export class PrivateRoomServer extends YServer<AppContext['Bindings']> {
  private db: PostgresJsDatabase | null = null;

  private room: RoomEntity | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

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

    if (data.roomContent) {
      Y.applyUpdate(
        this.document,
        new Uint8Array(Buffer.from(data.roomContent.rawContent, 'base64'))
      );
    } else {
      this.initializeDefaultValues();
    }
  }

  private initializeDefaultValues() {
    // nothing to do here so far
    return;
  }

  async onSave() {
    // called every few seconds after edits, and when the room empties
    // you can use this to write to a database or some external storage

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
    };

    await db
      .insert(roomContentTable)
      .values(roomContent)
      .onConflictDoUpdate({
        target: [roomContentTable.roomId],
        set: {
          updatedAt: new Date().toISOString(),
          rawPrivateContent: roomContent.rawPrivateContent,
        },
      });
  }

  private getDb() {
    if (!this.db) {
      const sql = postgres(this.env.DATABASE_URL);
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
}
