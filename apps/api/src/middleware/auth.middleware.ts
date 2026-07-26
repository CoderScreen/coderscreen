import * as Sentry from '@sentry/cloudflare';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { AppContext } from '@/index';
import { useAuth } from '@/lib/auth';

/**
 * Session-cookie auth for the internal (web app) API. Programmatic access uses
 * an API key against the separate public `/v1` surface (see
 * apiKey.middleware.ts) so a key can never reach internal-only routes.
 */
export const authMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
  const auth = useAuth(ctx);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session) {
    throw new HTTPException(401, {
      message: 'Unauthorized',
    });
  }

  // @ts-ignore since better auth type inference broke
  ctx.set('user', session.user);
  // @ts-ignore since better auth type inference broke
  ctx.set('session', session.session);

  // Attach the authenticated user to the current request's Sentry scope so
  // reported errors are tied to who hit them.
  Sentry.setUser({ id: session.user.id, email: session.user.email });

  return next();
});
