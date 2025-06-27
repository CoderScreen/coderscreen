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
import { UnifiedRoomDo } from './durable-objects/room.do';
import { Sandbox } from './containers/CustomSandbox.do';

export interface AppContext {
	Variables: {
		appFactory: AppFactory;
		db: PostgresJsDatabase;

		// auth stuff
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
	};
	Bindings: {
		ROOM_DO: DurableObjectNamespace<UnifiedRoomDo>;
		SANDBOX: DurableObjectNamespace<Sandbox>;

		FE_APP_URL: string;
		DATABASE_URL: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
	};
}

const app = new Hono<AppContext>()
	.use(logger())
	.use(
		cors({
			origin: ['https://coderscreen.com', 'http://localhost:3000'],
			credentials: true,
		}),
	)
	.use(appFactoryMiddleware)
	.all('/auth/*', (ctx) => {
		return useAuth(ctx).handler(ctx.req.raw);
	})
	.use('*', except('/rooms/:roomId/public', authMiddleware))
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
	}),
);

export default app;

export type AppRouter = typeof app;
export { UnifiedRoomDo, Sandbox };
