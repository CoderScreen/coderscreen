import { z } from 'zod';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { AppContext } from '../..';
import { PublicRoomSchema } from '@/schema/room.zod';
import { idString } from '@coderscreen/common/id';
import { RoomService } from '@/services/Room.service';
import { HTTPException } from 'hono/http-exception';
import { publicRoomMiddleware } from '@/middleware/room.middleware';

export const publicRoomRouter = new Hono<AppContext>()
	.use(publicRoomMiddleware)
	.get(
		'/',
		describeRoute({
			description: 'Get public room info',
			validateResponse: true,
			responses: {
				200: {
					description: 'Public room info',
					content: {
						'application/json': {
							schema: resolver(PublicRoomSchema),
						},
					},
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				roomId: idString('room'),
			}),
		),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');

			const roomService = new RoomService(ctx);
			const publicRoom = await roomService.getPublicRoom(roomId);

			if (!publicRoom) {
				throw new HTTPException(404, {
					message: 'Room not found',
				});
			}

			return ctx.json(publicRoom);
		},
	)
	.all(
		'/ws',
		describeRoute({
			description: 'Unified room endpoint - handles both code and instruction documents',
			responses: {
				200: {
					description: 'Room response',
				},
				101: {
					description: 'WebSocket upgrade',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				roomId: z.string(),
			}),
		),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');

			// Get the durable object stub
			const id = ctx.env.ROOM_DO.idFromName(roomId);
			const obj = ctx.env.ROOM_DO.get(id);

			// Forward the request to the durable object
			return obj.fetch(ctx.req.raw);
		},
	);
