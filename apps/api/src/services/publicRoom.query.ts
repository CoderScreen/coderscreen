import type { Id } from '@coderscreen/common/id';
import { roomTable } from '@coderscreen/db/room.db';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PublicRoomSchema } from '@/schema/room.zod';

export const publicRoomColumns = {
  id: roomTable.id,
  organizationId: roomTable.organizationId,
  createdAt: roomTable.createdAt,
  updatedAt: roomTable.updatedAt,
  title: roomTable.title,
  language: roomTable.language,
  status: roomTable.status,
} satisfies Record<keyof PublicRoomSchema, (typeof roomTable)[keyof typeof roomTable]>;

export function buildPublicRoomQuery(db: PostgresJsDatabase, id: Id<'room'>) {
  return db.select(publicRoomColumns).from(roomTable).where(eq(roomTable.id, id));
}

export async function selectPublicRoom(
  db: PostgresJsDatabase,
  id: Id<'room'>
): Promise<PublicRoomSchema | null> {
  const rows = await buildPublicRoomQuery(db, id);
  return rows[0] ?? null;
}
