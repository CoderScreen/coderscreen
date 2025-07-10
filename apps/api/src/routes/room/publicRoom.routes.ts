import { z } from 'zod';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { AppContext } from '../..';
import { idString } from '@coderscreen/common/id';
import { RoomService } from '@/services/Room.service';
import { publicRoomMiddleware } from '@/middleware/room.middleware';
import { CodeRunService } from '@/services/CodeRun.service';
import { PublicRoomSchema, RoomLanguageSchema } from '@/schema/room.zod';
import { partyKitMiddleware } from '@/middleware/partyKit.middleware';
import { ExecOutputSchema } from '@/schema/sandbox.zod';
import { whiteboardRouter } from '@/routes/room/whiteboard.router';
import { HTTPException } from 'hono/http-exception';

export const publicRoomRouter = new Hono<AppContext>()
	.use(publicRoomMiddleware)
	.route('/whiteboard', whiteboardRouter)
	.use('/connect/*', partyKitMiddleware)
	.get(
		'/',
		describeRoute({
			description: 'Get public room	 info',
			responses: {
				200: {
					description: 'Room info',
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
			})
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
		}
	)
	// POST /rooms/:id/run - Run the code in the room
	.post(
		'/run',
		describeRoute({
			description: 'Run the code in the room',
			responses: {
				200: {
					description: 'Room code run successfully',
					content: {
						'application/json': {
							schema: resolver(ExecOutputSchema),
						},
					},
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				roomId: idString('room'),
			})
		),
		zValidator('json', z.object({ code: z.string(), language: RoomLanguageSchema })),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');
			const { code, language } = ctx.req.valid('json');

			const codeRunService = new CodeRunService(ctx);

			const result = await codeRunService.runCode({ roomId, code, language });

			return ctx.json(result);
		}
	);
