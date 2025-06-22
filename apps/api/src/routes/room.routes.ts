import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import z from 'zod';
import { AppContext } from '..';
import { RoomService } from '@/services/Room.service';
import { RoomSchema } from '@/schema/room.zod';
import { idString } from '@coderscreen/common/id';

export const roomRouter = new Hono<AppContext>()
	// GET /rooms - List all rooms
	.get(
		'/',
		describeRoute({
			description: 'Get all rooms',
			responses: {
				200: {
					description: 'List of rooms',
					content: {
						'application/json': {
							schema: resolver(z.array(RoomSchema)),
						},
					},
				},
			},
		}),
		async (ctx) => {
			const roomService = new RoomService(ctx);
			const rooms = await roomService.listRooms();
			return ctx.json(rooms);
		},
	)
	// POST /rooms - Create a new room
	.post(
		'/',
		describeRoute({
			description: 'Create a new room',
			responses: {
				200: {
					description: 'Room created successfully',
					content: {
						'application/json': {
							schema: resolver(RoomSchema),
						},
					},
				},
			},
		}),
		zValidator('json', RoomSchema.omit({ id: true, createdAt: true, updatedAt: true })),
		async (ctx) => {
			const roomService = new RoomService(ctx);
			const body = ctx.req.valid('json');
			const result = await roomService.createRoom(body);
			return ctx.json(result, 201);
		},
	)
	// GET /rooms/:id - Get a specific room
	.get(
		'/:id',
		describeRoute({
			description: 'Get a specific room by ID',
			responses: {
				200: {
					description: 'Room details',
					content: {
						'application/json': {
							schema: resolver(RoomSchema),
						},
					},
				},
				404: {
					description: 'Room not found',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('room'),
			}),
		),
		async (ctx) => {
			const roomService = new RoomService(ctx);
			const { id } = ctx.req.valid('param');
			const rooms = await roomService.getRoom(id);

			if (!rooms || rooms.length === 0) {
				return ctx.json({ error: 'Room not found' }, 404);
			}

			return ctx.json(rooms[0]);
		},
	)
	// PATCH /rooms/:id - Update a room
	.patch(
		'/:id',
		describeRoute({
			description: 'Update a room',
			responses: {
				200: {
					description: 'Room updated successfully',
					content: {
						'application/json': {
							schema: resolver(RoomSchema),
						},
					},
				},
				404: {
					description: 'Room not found',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('room'),
			}),
		),
		zValidator('json', RoomSchema.partial()),
		async (ctx) => {
			const roomService = new RoomService(ctx);
			const { id } = ctx.req.valid('param');
			const body = ctx.req.valid('json');

			const result = await roomService.updateRoom(id, body);
			return ctx.json(result);
		},
	)
	// DELETE /rooms/:id - Delete a room
	.delete(
		'/:id',
		describeRoute({
			description: 'Delete a room',
			responses: {
				200: {
					description: 'Room deleted successfully',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('room'),
			}),
		),
		async (ctx) => {
			const roomService = new RoomService(ctx);
			const { id } = ctx.req.valid('param');

			await roomService.deleteRoom(id);
			return ctx.json(null, 200);
		},
	);
