import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import z from 'zod';
import { AppContext } from '../..';
import { UnifiedRoom } from '../../durable-objects';

export const publicRoomRouter = new Hono<AppContext>()
	// Unified room route - handles both HTTP and WebSocket connections
	.all(
		'/',
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
	)
	// HTTP route to get unified room information
	.get(
		'/info',
		describeRoute({
			description: 'Get unified room information',
			responses: {
				200: {
					description: 'Room information',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									roomId: z.string(),
									connections: z.number(),
									documentSize: z.number(),
									lastModified: z.string(),
									roomType: z.string(),
								}),
							),
						},
					},
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

			// Create a request to the durable object's info endpoint
			const request = new Request(`${ctx.req.url.replace('/info', '')}`, {
				method: 'GET',
				headers: ctx.req.raw.headers,
			});

			// Forward the request to the durable object
			return obj.fetch(request);
		},
	)
	// HTTP route to get unified room status
	.get(
		'/status',
		describeRoute({
			description: 'Get unified room status',
			responses: {
				200: {
					description: 'Room status',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									connected: z.boolean(),
									connectionCount: z.number(),
									documentExists: z.boolean(),
									roomType: z.string(),
								}),
							),
						},
					},
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

			// Create a request to the durable object's status endpoint
			const request = new Request(`${ctx.req.url.replace('/status', '')}/status`, {
				method: 'GET',
				headers: ctx.req.raw.headers,
			});

			// Forward the request to the durable object
			return obj.fetch(request);
		},
	)
	// HTTP route to reset code document
	.post(
		'/code/reset',
		describeRoute({
			description: 'Reset code document in unified room',
			responses: {
				200: {
					description: 'Code document reset successfully',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									message: z.string(),
								}),
							),
						},
					},
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

			// Create a request to the durable object's code reset endpoint
			const request = new Request(`${ctx.req.url.replace('/code/reset', '')}/code/reset`, {
				method: 'POST',
				headers: ctx.req.raw.headers,
			});

			// Forward the request to the durable object
			return obj.fetch(request);
		},
	)
	// HTTP route to reset instructions document
	.post(
		'/instructions/reset',
		describeRoute({
			description: 'Reset instructions document in unified room',
			responses: {
				200: {
					description: 'Instructions document reset successfully',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									message: z.string(),
								}),
							),
						},
					},
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

			// Create a request to the durable object's instructions reset endpoint
			const request = new Request(`${ctx.req.url.replace('/instructions/reset', '')}/instructions/reset`, {
				method: 'POST',
				headers: ctx.req.raw.headers,
			});

			// Forward the request to the durable object
			return obj.fetch(request);
		},
	)
	// HTTP route to reset all documents
	.post(
		'/reset',
		describeRoute({
			description: 'Reset all documents in unified room',
			responses: {
				200: {
					description: 'All documents reset successfully',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									message: z.string(),
								}),
							),
						},
					},
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

			// Create a request to the durable object's reset endpoint
			const request = new Request(`${ctx.req.url.replace('/reset', '')}/reset`, {
				method: 'POST',
				headers: ctx.req.raw.headers,
			});

			// Forward the request to the durable object
			return obj.fetch(request);
		},
	);
