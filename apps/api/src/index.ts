import { getSandbox } from '@cloudflare/sandbox';
import { switchPort } from '@cloudflare/containers';
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
import { SandboxDO as Sandbox } from './sandbox/SandboxDO';
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

// Preview proxy: route subdomain requests like {port}-{sandboxId}-{token}.hostname to the sandbox container
function extractSandboxRoute(url: URL) {
  // Pattern: {port}-{sandboxId}-{16-char-token}.{hostname}
  const match = url.hostname.match(
    /^(\d{4,5})-([^.-][^.]*?[^.-]|[^.-])-([a-z0-9_-]{16})\.(.+)$/
  );
  if (!match) return null;

  const port = parseInt(match[1], 10);
  const sandboxId = match[2];
  const token = match[3];
  if (sandboxId.length > 63) return null;

  return { port, sandboxId, token, path: url.pathname || '/' };
}

async function proxyToSandbox(request: Request, env: Env): Promise<Response | null> {
  try {
    const url = new URL(request.url);
    const route = extractSandboxRoute(url);
    if (!route) return null;

    const { sandboxId, port, path } = route;
    const sandbox = getSandbox(env.SANDBOX, sandboxId);

    // WebSocket upgrade → must use fetch() (bypasses JSRPC serialization)
    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      return await sandbox.fetch(switchPort(request, port));
    }

    const proxyUrl = `http://localhost:${port}${path}${url.search}`;
    const proxyRequest = new Request(proxyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // @ts-expect-error duplex required for body streaming
      duplex: 'half',
    });

    return await sandbox.containerFetch(proxyRequest, port);
  } catch (error) {
    console.error('[preview-proxy] error:', error);
    return new Response('Preview proxy error', { status: 502 });
  }
}

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    const previewResponse = await proxyToSandbox(request, env);
    if (previewResponse) return previewResponse;
    return app.fetch(request, env, ctx);
  },
};

export type AppRouter = typeof app;
export { Sandbox, PartyServer, PrivateRoomServer, WhiteboardDurableObject };
