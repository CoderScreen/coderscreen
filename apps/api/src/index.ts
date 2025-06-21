import { Hono } from 'hono';
import { CodeRoom } from './durable-objects/code-room.do';
import { InstructionRoom } from './durable-objects/instruction-room.do';
import { CodeRunService } from './service/CodeRun.service';
import { openAPISpecs } from 'hono-openapi';
import { roomRouter } from './routes/room.routes';
export interface AppContext {
	Bindings: {
		CODE_ROOM: DurableObjectNamespace;
		INSTRUCTION_ROOM: DurableObjectNamespace;
	};
}

const app = new Hono<AppContext>().route('/room', roomRouter);

app.get('/', async (ctx) => {
	const codeRunService = new CodeRunService(ctx);

	const result = await codeRunService.runCode({
		roomId: 'r_123',
		code: 'console.log("Hello, world!"); // This is a comment',
	});
	console.log(result);

	return ctx.json({
		message: 'Code Interview API',
		version: '1.0.0',
		endpoints: {
			code: '/room/:roomId/code',
			instructions: '/room/:roomId/instructions',
		},
		result,
	});
});

// Route for CodeRoom durable object - handles both HTTP and WebSocket connections
app.all('/room/code/:roomId', async (ctx) => {
	const roomId = ctx.req.param('roomId')!;

	// Get the durable object stub
	const id = ctx.env.CODE_ROOM.idFromName(roomId);
	const obj = ctx.env.CODE_ROOM.get(id);

	// Forward the request to the durable object
	return obj.fetch(ctx.req.raw);
});

// Route for InstructionRoom durable object - handles both HTTP and WebSocket connections
app.all('/room/instructions/:roomId', async (ctx) => {
	const roomId = ctx.req.param('roomId')!;

	// Get the durable object stub
	const id = ctx.env.INSTRUCTION_ROOM.idFromName(roomId);
	const obj = ctx.env.INSTRUCTION_ROOM.get(id);

	// Forward the request to the durable object
	return obj.fetch(ctx.req.raw);
});

// HTTP route to get code room information
app.get('/room/:roomId/code/info', async (ctx) => {
	const roomId = ctx.req.param('roomId');

	// Get the durable object stub
	const id = ctx.env.CODE_ROOM.idFromName(roomId);
	const obj = ctx.env.CODE_ROOM.get(id);

	// Create a request to the durable object's info endpoint
	const request = new Request(`${ctx.req.url.replace('/info', '')}`, {
		method: 'GET',
		headers: ctx.req.raw.headers,
	});

	// Forward the request to the durable object
	return obj.fetch(request);
});

// HTTP route to get instruction room information
app.get('/room/:roomId/instructions/info', async (ctx) => {
	const roomId = ctx.req.param('roomId');

	// Get the durable object stub
	const id = ctx.env.INSTRUCTION_ROOM.idFromName(roomId);
	const obj = ctx.env.INSTRUCTION_ROOM.get(id);

	// Create a request to the durable object's info endpoint
	const request = new Request(`${ctx.req.url.replace('/info', '')}`, {
		method: 'GET',
		headers: ctx.req.raw.headers,
	});

	// Forward the request to the durable object
	return obj.fetch(request);
});

// HTTP route to get code room status
app.get('/room/:roomId/code/status', async (ctx) => {
	const roomId = ctx.req.param('roomId');

	// Get the durable object stub
	const id = ctx.env.CODE_ROOM.idFromName(roomId);
	const obj = ctx.env.CODE_ROOM.get(id);

	// Create a request to the durable object's status endpoint
	const request = new Request(`${ctx.req.url.replace('/status', '')}/status`, {
		method: 'GET',
		headers: ctx.req.raw.headers,
	});

	// Forward the request to the durable object
	return obj.fetch(request);
});

// HTTP route to get instruction room status
app.get('/room/:roomId/instructions/status', async (ctx) => {
	const roomId = ctx.req.param('roomId');

	// Get the durable object stub
	const id = ctx.env.INSTRUCTION_ROOM.idFromName(roomId);
	const obj = ctx.env.INSTRUCTION_ROOM.get(id);

	// Create a request to the durable object's status endpoint
	const request = new Request(`${ctx.req.url.replace('/status', '')}/status`, {
		method: 'GET',
		headers: ctx.req.raw.headers,
	});

	// Forward the request to the durable object
	return obj.fetch(request);
});

app.get(
	'/openapi',
	openAPISpecs(app, {
		documentation: {
			info: {
				title: 'CoderScreen API',
				version: '1.0.0',
				description: 'API for coder screen',
			},
			servers: [
				{
					url: 'https://api.coderscreen.com',
					description: 'Production server',
				},
				{
					url: 'http://localhost:8000',
					description: 'Local server',
				},
			],
		},
	})
);

export default app;

export type AppRouter = typeof app;

export { CodeRoom, InstructionRoom };
