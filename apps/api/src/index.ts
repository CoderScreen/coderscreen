import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Hono } from 'hono';
import { except } from 'hono/combine';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { openAPISpecs } from 'hono-openapi';
import { useAuth } from '@/lib/auth';
import { getBilling } from '@/lib/session';
import { authMiddleware } from '@/middleware/auth.middleware';
import { RoomServer as PartyServer } from '@/partykit/room.do';
import { billingRouter } from '@/routes/billing.routes';
import { templateRouter } from '@/routes/template.routes';
import { webhookRouter } from '@/routes/webhook.routes';
import { PublicRoomSchema } from '@/schema/room.zod';
import { AppFactory, appFactoryMiddleware } from '@/services/AppFactory';
import { auth } from '../better-auth.config';
import { CustomSandbox as Sandbox } from './containers/CustomSandbox';
import { WhiteboardDurableObject } from './durable-objects/whiteboard.do';
import { PrivateRoomServer } from './partykit/privateRoom.do';
import { assetRouter } from './routes/asset.routes';
import { publicRoomRouter } from './routes/room/publicRoom.routes';
import { roomRouter } from './routes/room.routes';

export interface AppContext {
  Variables: {
    appFactory: AppFactory;
    db: PostgresJsDatabase;

    // auth stuff
    user:
      | (typeof auth.$Infer.Session.user & {
          isOnboarded: boolean;
        })
      | null;
    session:
      | (typeof auth.$Infer.Session.session & {
          activeOrganizationId: string | null;
        })
      | null;

    // public stuff
    publicRoom: PublicRoomSchema | null;

    // data stuff
    subscription: Awaited<ReturnType<typeof getBilling>> | null;
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
  .use((ctx, next) => {
    return cors({
      origin: ctx.env.FE_APP_URL,
      credentials: true,
    })(ctx, next);
  })
  .use(appFactoryMiddleware)
  .all('/auth/*', (ctx) => {
    return useAuth(ctx).handler(ctx.req.raw);
  })
  .use('*', except(['/webhook/*', '/rooms/:roomId/public/*', '/openapi'], authMiddleware))
  .route('/webhook', webhookRouter)
  .route('/rooms/:roomId/public', publicRoomRouter)
  .route('/assets', assetRouter)
  .route('/templates', templateRouter)
  .route('/rooms', roomRouter)
  .route('/billing', billingRouter)
  .onError((err, ctx) => {
    const cfRayId = ctx.req.header('cf-ray') ?? crypto.randomUUID();

    if (err instanceof HTTPException) {
      return ctx.json(
        {
          id: cfRayId,
          timestamp: new Date().toISOString(),
          message: err.message,
        },
        err.status
      );
    } else if (err instanceof Error) {
      return ctx.json(
        {
          id: cfRayId,
          timestamp: new Date().toISOString(),
          message: err.message,
        },
        500
      );
    } else {
      return ctx.json(
        {
          id: cfRayId,
          timestamp: new Date().toISOString(),
          message: 'Unknown server error',
        },
        500
      );
    }
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
        },
      ],
    },
  })
);

export default app;

export type AppRouter = typeof app;
export { Sandbox, PartyServer, PrivateRoomServer, WhiteboardDurableObject };
