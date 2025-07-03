import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { useDb } from '@/db/client';
import { Context } from 'hono';
import { AppContext } from '@/index';
import { PublicRoomSchema } from '@/schema/room.zod';
import { generateId, Id } from '@coderscreen/common/id';

import { eq, desc, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getSession } from '@/lib/session';
import { TemplateEntity } from '@coderscreen/db/template.db';

export class RoomService {
	private readonly db: PostgresJsDatabase;

	constructor(private readonly ctx: Context<AppContext>) {
		this.db = useDb(ctx);
	}

	async createRoom(values: Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'userId'>) {
		const { user, orgId } = getSession(this.ctx);
		return this.db
			.insert(roomTable)
			.values({
				id: generateId('room'),
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
			createdAt: room.createdAt,
			updatedAt: room.updatedAt,
			title: room.title,
			language: room.language,
			status: room.status,
		};
	}

	async listRooms() {
		const { orgId } = getSession(this.ctx);
		return this.db.select().from(roomTable).where(eq(roomTable.organizationId, orgId)).orderBy(desc(roomTable.createdAt));
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

		return this.db
			.delete(roomTable)
			.where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
			.returning()
			.then((data) => data[0]);
	}

	/**
	 * Ending the interview should update the status, save final details
	 */
	async endRoom(id: Id<'room'>) {
		const { orgId } = getSession(this.ctx);

		return this.db
			.update(roomTable)
			.set({ status: 'completed' })
			.where(and(eq(roomTable.id, id), eq(roomTable.organizationId, orgId)))
			.returning()
			.then((data) => data[0]);
	}

	async loadTemplate(params: { room: RoomEntity; template: TemplateEntity }) {
		const { room, template } = params;

		// Get the durable object to load new information
		const id = this.ctx.env.ROOM_DO.idFromName(room.id);
		const roomDo = this.ctx.env.ROOM_DO.get(id);

		roomDo.handleLoadTemplate(template);
	}
}
