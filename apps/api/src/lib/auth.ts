import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions, User } from 'better-auth';
import { AppContext } from '@/index';
import { Context } from 'hono';
import * as schema from '@coderscreen/db/user.db';
import { auth, betterAuthConfig } from '../../better-auth.config';
import { useDb } from '@/db/client';

export const useAuth: (ctx: Context<AppContext>) => ReturnType<typeof betterAuth<typeof betterAuthConfig>> = (ctx) => {
	const env = ctx.env;
	const db = useDb(ctx);

	// @ts-ignore
	return betterAuth({
		trustedOrigins: [env.FE_APP_URL],
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'pg', schema }),
		...betterAuthConfig,
	});
};
