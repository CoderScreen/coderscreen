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
import { RoomServer as PartyServer } from '@/partykit/room.do';
import { WhiteboardDurableObject } from './durable-objects/whiteboard.do';
import { PrivateRoomServer } from './partykit/privateRoom.do';
import { billingRouter } from '@/routes/billing.routes';
import { webhookRouter } from '@/routes/webhook.routes';
import { useBilling } from '@/lib/session';

export interface AppContext {
  Variables: {
    appFactory: AppFactory;
    db: PostgresJsDatabase;

    // auth stuff
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;

    // public stuff
    publicRoom: PublicRoomSchema | null;

    // data stuff
    subscription: Awaited<ReturnType<typeof useBilling>> | null;
  };
  Bindings: Env;
}

const app = new Hono<AppContext>()
  .use(logger())
  .get('/', (ctx) => {
    return ctx.text(
      'Welcome to CoderScreen API. Visit https://docs.coderscreen.com for documentation.',
      200
    );
  })
  .get('/health', (ctx) => {
    return ctx.text('ok', 200);
  })
  .use(
    cors({
      origin: ['https://coderscreen.com', 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    })
  )
  .use(appFactoryMiddleware)
  .all('/auth/*', (ctx) => {
    return useAuth(ctx).handler(ctx.req.raw);
  })
  .route('/webhook', webhookRouter)
  .route('/rooms/:roomId/public', publicRoomRouter)
  .use('*', authMiddleware)
  // .use('partykit/*', partyKitMiddleware)
  .route('/assets', assetRouter)
  .route('/templates', templateRouter)
  .route('/rooms', roomRouter)
  .route('/billing', billingRouter);

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
        },
      ],
    },
  })
);

export default app;

export type AppRouter = typeof app;
export { Sandbox, PartyServer, PrivateRoomServer, WhiteboardDurableObject };
