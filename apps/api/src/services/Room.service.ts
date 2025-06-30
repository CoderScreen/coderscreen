import { roomTable } from '@coderscreen/db/room.db';
import { useDb } from '@/db/client';
import { Context } from 'hono';
import { AppContext } from '@/index';
import { RoomSchema } from '@/schema/room.zod';
import { generateId, Id } from '@coderscreen/common/id';

import { eq, desc, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getSession } from '@/lib/session';

export class RoomService {
	private readonly db: PostgresJsDatabase;

	constructor(private readonly ctx: Context<AppContext>) {
		this.db = useDb(ctx);
	}

	async createRoom(values: Omit<RoomSchema, 'id' | 'createdAt' | 'updatedAt'>) {
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

	async listRooms() {
		const { orgId } = getSession(this.ctx);

		return this.db.select().from(roomTable).where(eq(roomTable.organizationId, orgId)).orderBy(desc(roomTable.createdAt));
	}

	async updateRoom(id: Id<'room'>, values: Partial<RoomSchema>) {
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
}
