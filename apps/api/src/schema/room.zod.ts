import { z } from 'zod';
import { idString } from '@coderscreen/common/id';

export const RoomSchema = z.object({
	id: idString('room'),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	title: z.string(),
	language: z.enum(['typescript', 'javascript', 'python', 'rust', 'c++']),
	status: z.enum(['active', 'scheduled', 'completed', 'archived']),
	notes: z.string(),
});

// Public room schema is strict and only includes the fields that are safe to expose
export const PublicRoomSchema = RoomSchema.omit({
	notes: true,
}).strict();

export type RoomSchema = z.infer<typeof RoomSchema>;
export type PublicRoomSchema = z.infer<typeof PublicRoomSchema>;
