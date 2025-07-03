import { z } from 'zod';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { AppContext } from '../..';
import { idString } from '@coderscreen/common/id';
import { RoomService } from '@/services/Room.service';
import { publicRoomMiddleware } from '@/middleware/room.middleware';
import { CodeRunService } from '@/services/CodeRun.service';
import { PublicRoomSchema } from '@/schema/room.zod';
import { partyKitMiddleware } from '@/middleware/partyKit.middleware';

export const publicRoomRouter = new Hono<AppContext>()
	.use(publicRoomMiddleware)
	.use('/partykit/*', partyKitMiddleware)
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
			}),
		),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');

			const roomService = new RoomService(ctx);
			const publicRoom = await roomService.getPublicRoom(roomId);

			return ctx.json(publicRoom);
		},
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
							schema: resolver(z.object({ result: z.string() })),
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
		zValidator('json', z.object({ code: z.string(), language: z.string() })),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');
			const { code, language } = ctx.req.valid('json');

			const codeRunService = new CodeRunService(ctx);

			console.log('running code');
			let start = Date.now();
			const result = await codeRunService.runCode({ roomId, code, language });
			let end = Date.now();
			console.log('codeRunService.runCode', end - start);

			const codeOutput = 'Hello World';
			return ctx.json({ codeOutput });
		},
	);
