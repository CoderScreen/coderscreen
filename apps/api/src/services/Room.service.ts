import { roomTable } from '@coderscreen/db/room.db';
import { db } from '@/db/client';
import { Context } from 'hono';
import { AppContext } from '@/index';
import { RoomSchema } from '@/schema/room.zod';
import { generateId, Id } from '@coderscreen/common/id';
import { eq } from 'drizzle-orm';

export class RoomService {
	constructor(private readonly ctx: Context<AppContext>) {}

	async createRoom(values: Omit<RoomSchema, 'id' | 'createdAt' | 'updatedAt'>) {
		return db.insert(roomTable).values({
			id: generateId('room'),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			...values,
		});
	}

	async getRoom(id: Id<'room'>) {
		return db.select().from(roomTable).where(eq(roomTable.id, id));
	}

	async listRooms() {
		return db.select().from(roomTable);
	}

	async updateRoom(id: Id<'room'>, values: Partial<RoomSchema>) {
		return db
			.update(roomTable)
			.set({
				...values,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(roomTable.id, id));
	}

	async deleteRoom(id: Id<'room'>) {
		return db.delete(roomTable).where(eq(roomTable.id, id));
	}
}
