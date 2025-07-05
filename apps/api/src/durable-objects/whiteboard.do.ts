import { Id } from '@coderscreen/common/id';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { TLRecord, createTLSchema, defaultShapeSchemas } from '@tldraw/tlschema';
import { Hono } from 'hono';
import throttle from 'lodash.throttle';

const schema = createTLSchema({
	shapes: { ...defaultShapeSchemas },
});

export class WhiteboardDurableObject {
	static PERSIST_INTERVAL = 10_000;

	private r2: R2Bucket;
	private roomId: Id<'room'> | null = null;
	private roomPromise: Promise<TLSocketRoom<TLRecord, void>> | null = null;
	private app: Hono<{ Bindings: Env }>;

	constructor(private readonly ctx: DurableObjectState, env: Env) {
		this.r2 = env.WHITEBOARD_ASSETS_BUCKET;

		ctx.blockConcurrencyWhile(async () => {
			this.roomId = ((await this.ctx.storage.get('roomId')) ?? null) as Id<'room'> | null;
		});

		this.app = new Hono<{ Bindings: Env }>();

		this.app.get('/rooms/:roomId/public/whiteboard/connect', async (c) => {
			if (!this.roomId) {
				await this.ctx.blockConcurrencyWhile(async () => {
					await this.ctx.storage.put('roomId', c.req.param('roomId'));
					this.roomId = c.req.param('roomId') as Id<'room'>;
				});
			}
			return this.handleConnect(c);
		});
	}

	fetch(request: Request): Response | Promise<Response> {
		return this.app.fetch(request);
	}

	async handleConnect(c: {
		req: { query: (key: string) => string | undefined; param: (key: string) => string };
		json: (data: any, status: number) => Response;
	}): Promise<Response> {
		const sessionId = c.req.query('sessionId');
		if (!sessionId) return c.json({ error: 'Missing sessionId' }, 400);

		const { 0: clientWebSocket, 1: serverWebSocket } = new WebSocketPair();
		serverWebSocket.accept();

		const room = await this.getRoom();

		room.handleSocketConnect({ sessionId, socket: serverWebSocket });

		return new Response(null, { status: 101, webSocket: clientWebSocket });
	}

	getRoom() {
		const roomId = this.roomId;
		if (!roomId) throw new Error('Missing roomId');

		if (!this.roomPromise) {
			this.roomPromise = (async () => {
				const roomFromBucket = await this.r2.get(`rooms/${roomId}`);

				const initialSnapshot = roomFromBucket ? ((await roomFromBucket.json()) as RoomSnapshot) : undefined;

				return new TLSocketRoom<TLRecord, void>({
					schema,
					initialSnapshot,
					onDataChange: this.schedulePersistToR2,
				});
			})();
		}

		return this.roomPromise;
	}

	// we throttle persistance so it only happens every 10 seconds
	schedulePersistToR2: () => void = throttle(async () => {
		if (!this.roomPromise || !this.roomId) return;
		const room = await this.getRoom();

		// convert the room to JSON and upload it to R2
		const snapshot = JSON.stringify(room.getCurrentSnapshot());
		await this.r2.put(`rooms/${this.roomId}`, snapshot);

		return;
	}, WhiteboardDurableObject.PERSIST_INTERVAL);
}
