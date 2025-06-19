import { Hono } from 'hono';
import { CodeRoom } from './durable-objects/CodeRoom.do';

export interface AppContext {
	Bindings: {
		CODE_ROOM: DurableObjectNamespace;
	};
}

const app = new Hono<AppContext>();

app.get('/', async (ctx) => {
	// return ctx.json(result);
	return ctx.json({ message: 'Hello, World!' });
});

app.get('/room/:roomId', async (ctx) => {
	const roomId = ctx.req.param('roomId');
	return ctx.json({ message: `Hello, ${roomId}!` });
});

// Route for CodeRoom durable object - handles both HTTP and WebSocket connections
app.all('/room/:roomId/ws', async (ctx) => {
	const roomId = ctx.req.param('roomId');

	// Get the durable object stub
	const id = ctx.env.CODE_ROOM.idFromName(roomId);
	const obj = ctx.env.CODE_ROOM.get(id);

	// Forward the request to the durable object
	return obj.fetch(ctx.req.raw);
});

// HTTP route to get room information
app.get('/room/:roomId/info', async (ctx) => {
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

// HTTP route to get room status
app.get('/room/:roomId/status', async (ctx) => {
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

export default app;
export { CodeRoom };
