import { roomTable } from '@coderscreen/db/room.db';
import { useDb } from '@/db/client';
import { Context } from 'hono';
import { AppContext } from '@/index';
import { RoomSchema } from '@/schema/room.zod';
import { generateId, Id } from '@coderscreen/common/id';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export class RoomService {
	private readonly db: PostgresJsDatabase;

	constructor(private readonly ctx: Context<AppContext>) {
		this.db = useDb(ctx);
	}

	async createRoom(values: Omit<RoomSchema, 'id' | 'createdAt' | 'updatedAt'>) {
		return this.db.insert(roomTable).values({
			id: generateId('room'),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			...values,
		});
	}

	async getRoom(id: Id<'room'>) {
		return this.db.select().from(roomTable).where(eq(roomTable.id, id));
	}

	async listRooms() {
		return this.db.select().from(roomTable);
	}

	async updateRoom(id: Id<'room'>, values: Partial<RoomSchema>) {
		return this.db
			.update(roomTable)
			.set({
				...values,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(roomTable.id, id));
	}

	async deleteRoom(id: Id<'room'>) {
		return this.db.delete(roomTable).where(eq(roomTable.id, id));
	}
}
