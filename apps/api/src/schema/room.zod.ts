import { z } from 'zod';
import { idString } from '@coderscreen/common/id';
import { roomLanguageEnum } from '@coderscreen/db/room.db';

export const RoomSchema = z.object({
	id: idString('room'),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	language: z.enum(roomLanguageEnum.enumValues),
});

export type RoomSchema = z.infer<typeof RoomSchema>;
