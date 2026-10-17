import { generateId, Id } from '@coderscreen/common/id';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { and, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getServerByName } from 'partyserver';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import { ChatMessage, User } from '@/partykit/internal/AI.service';
import { PublicRoomSchema } from '@/schema/room.zod';
import { UsageService } from '@/services/billing/Usage.service';

// Rooms deleted within this long of being created give their interview back
const ROOM_REFUND_WINDOW_MS = 10 * 60 * 1000;

export class RoomService {
  private readonly db: PostgresJsDatabase;
  private readonly usageService: UsageService;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
    this.usageService = new UsageService(ctx);
  }

  async createRoom(
    values: Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'userId'>
  ) {
    const { user, orgId } = getSession(this.ctx);
    const roomId = generateId('room');

    const usageResult = await this.usageService.trackEvent({
      eventType: 'live_interview',
      resource: {
        id: roomId,
        type: 'room',
      },
    });

    if (!usageResult.allowed) {
      throw new HTTPException(403, {
        message: 'You have reached the limit of live interviews',
      });
    }

    return this.db
      .insert(roomTable)
      .values({
        id: roomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        userId: user.id,
        ...values,
      })
      .returning()
      .then((data) => data[0]);
  }

  async getRoom(id: Id<'room'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .select()
      .from(roomTable)
      .where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
      .then((data) => (data.length > 0 ? data[0] : null));
  }

  async getPublicRoom(id: Id<'room'>): Promise<PublicRoomSchema | null> {
    const local = this.ctx.get('publicRoom');
    if (local) {
      return local;
    }

    const room = await this.db
      .select()
      .from(roomTable)
      .where(eq(roomTable.id, id))
      .then((data) => (data.length > 0 ? data[0] : null));

    if (!room) {
      return null;
    }

    return {
      id: room.id,
      organizationId: room.organizationId,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      title: room.title,
      language: room.language,
      status: room.status,
    };
  }

  async listRooms() {
    const { orgId } = getSession(this.ctx);
    return this.db
      .select()
      .from(roomTable)
      .where(eq(roomTable.organizationId, orgId))
      .orderBy(desc(roomTable.createdAt));
  }

  async updateRoom(id: Id<'room'>, values: Partial<RoomEntity>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(roomTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
      .returning()
      .then((data) => data[0]);
  }

  async deleteRoom(id: Id<'room'>) {
    const { orgId } = getSession(this.ctx);

    // One transaction so the refund only lands if the delete does. The delete
    // returns the room to exactly one caller, so it can't be refunded twice.
    const deletedRoom = await this.db.transaction(async (tx) => {
      const room = await tx
        .delete(roomTable)
        .where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
        .returning()
        .then((data) => data[0]);

      // A room deleted shortly after creation was a test or a mistake, not an
      // interview, so it shouldn't use up the plan's limit
      if (room && Date.now() - new Date(room.createdAt).getTime() < ROOM_REFUND_WINDOW_MS) {
        await this.usageService.refundEvent(
          {
            eventType: 'live_interview',
            resource: { id, type: 'room' },
            trackedAt: room.createdAt,
          },
          tx
        );
      }

      return room;
    });

    if (deletedRoom) {
      // The live documents are stored in the room's Durable Objects. A purge
      // that fails here is retried by the object itself: it deletes its
      // storage the next time it loads and finds the room gone.
      const env = this.ctx.env;
      const results = await Promise.allSettled([
        env.Room.get(env.Room.idFromName(id)).purge(),
        env.PrivateRoom.get(env.PrivateRoom.idFromName(id)).purge(),
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          console.error(`Failed to purge room ${id} storage:`, result.reason);
        }
      }
    }

    return deletedRoom;
  }

  /**
   * Ending the interview should update the status, save final details
   */
  async endRoom(id: Id<'room'>) {
    const { orgId } = getSession(this.ctx);

    const updatedRoom = await this.db
      .update(roomTable)
      .set({ status: 'completed' })
      .where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
      .returning()
      .then((data) => data[0]);

    await this.handleStatusUpdate(id, 'completed');

    return updatedRoom;
  }

  async handleStatusUpdate(id: Id<'room'>, status: RoomEntity['status']) {
    // A plain RPC call doesn't start the room, so on a cold room the status
    // would land in an empty doc that never saves. getServerByName loads the
    // room's document first.
    const roomStub = await getServerByName(this.ctx.env.Room, id);
    await roomStub.handleStatusUpdate(status);
  }

  async loadTemplate() {
    // const { room, template } = params;
    // // Get the durable object to load new information
    // const id = this.ctx.env.ROOM_DO.idFromName(room.id);
    // const roomDo = this.ctx.env.ROOM_DO.get(id);
    // roomDo.handleLoadTemplate(template);
  }

  async aiChat(params: {
    roomId: Id<'room'>;
    userMessage: ChatMessage & { user: User };
    assistantMessage: ChatMessage;
  }) {
    // Rooms hibernate, and a plain RPC doesn't load the room's document.
    const roomStub = await getServerByName(this.ctx.env.Room, params.roomId);

    this.ctx.executionCtx.waitUntil(roomStub.handleAiChat(params));
  }

  // async addRoomUser(params: { roomId: Id<'room'>; user: RoomEntity['usersJoined'][number] }) {
  //   const { orgId } = getSession(this.ctx);

  //   return this.db
  //     .update(roomTable)
  //     .set({ usersJoined: [...roomTable.usersJoined, params.user] })
  //     .where(eq(roomTable.id, params.roomId));
  // }
}
