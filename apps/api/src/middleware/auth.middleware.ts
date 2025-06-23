import { AppContext } from '@/index';
import { useAuth } from '@/lib/auth';
import { createMiddleware } from 'hono/factory';

export const authMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
	const auth = useAuth(ctx);
	const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

	if (!session) {
		ctx.set('user', null);
		ctx.set('session', null);
		return next();
	}

	ctx.set('user', session.user);
	ctx.set('session', session.session);
	return next();
});
