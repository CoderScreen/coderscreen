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

export type RoomSchema = z.infer<typeof RoomSchema>;
