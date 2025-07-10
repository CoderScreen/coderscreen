import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import { roomRouter } from './routes/room.routes';
import { publicRoomRouter } from './routes/room/publicRoom.routes';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { AppFactory, appFactoryMiddleware } from '@/services/AppFactory';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { useAuth } from '@/lib/auth';
import { auth } from '../better-auth.config';
import { authMiddleware } from '@/middleware/auth.middleware';
import { except } from 'hono/combine';
import { assetRouter } from './routes/asset.routes';
import { CustomSandbox as Sandbox } from './containers/CustomSandbox';
import { templateRouter } from '@/routes/template.routes';
import { PublicRoomSchema } from '@/schema/room.zod';
import { RoomServer as PartyServer } from '@/partykit/server';
import { WhiteboardDurableObject } from './durable-objects/whiteboard.do';

export interface AppContext {
	Variables: {
		appFactory: AppFactory;
		db: PostgresJsDatabase;

		// auth stuff
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;

		// public stuff
		publicRoom: PublicRoomSchema | null;
	};
	Bindings: Env;
}

const app = new Hono<AppContext>()
	.use(logger())
	.get('/health', (ctx) => {
		return ctx.text('ok', 200);
	})
	.use(
		cors({
			origin: ['https://coderscreen.com', 'http://localhost:3000'],
			credentials: true,
		})
	)
	.use(appFactoryMiddleware)
	.all('/auth/*', (ctx) => {
		return useAuth(ctx).handler(ctx.req.raw);
	})
	.use('*', except(['/rooms/:roomId/public/*'], authMiddleware))
	// .use('partykit/*', partyKitMiddleware)
	.route('/assets', assetRouter)
	.route('/templates', templateRouter)
	.route('/rooms', roomRouter)
	.route('/rooms/:roomId/public', publicRoomRouter);

app.get(
	'/openapi',
	openAPISpecs(app, {
		documentation: {
			info: {
				title: 'CoderScreen API',
				version: '1.0.0',
				description: 'API for coder screen',
			},
			servers: [],
		},
	})
);

export default app;

export type AppRouter = typeof app;
export { Sandbox, PartyServer, WhiteboardDurableObject };
