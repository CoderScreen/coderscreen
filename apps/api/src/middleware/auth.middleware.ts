import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { AppContext } from '@/index';
import { useAuth } from '@/lib/auth';

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
  return next();
});
