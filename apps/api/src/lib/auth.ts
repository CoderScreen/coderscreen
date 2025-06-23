import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { AppContext } from '@/index';
import postgres from 'postgres';
import { Context } from 'hono';
import { organization } from 'better-auth/plugins';
import * as schema from '@coderscreen/db/user.db';

export const betterAuthConfig: BetterAuthOptions = {
	appName: 'CoderScreen',
	emailAndPassword: {
		enabled: true,
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }) => {
			console.log('sendVerificationEmail', { user, url, token });
			// Send verification email to user
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600, // 1 hour
	},
	plugins: [organization()],
};

export const useAuth = (ctx: Context<AppContext>): ReturnType<typeof betterAuth> => {
	const env = ctx.env;
	const sql = postgres(env.DATABASE_URL);
	const db = drizzle(sql);

	return betterAuth({
		trustedOrigins: [env.FE_APP_URL],
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'pg', schema }),
		...betterAuthConfig,
	});
};
