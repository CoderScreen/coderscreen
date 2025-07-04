import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions, User } from 'better-auth';
import { organization } from 'better-auth/plugins';
import * as schema from '@coderscreen/db/user.db';
import { eq } from 'drizzle-orm';

// @ts-ignore
const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

const sql = postgres(DATABASE_URL!);
const db = drizzle(sql);

export const betterAuthConfig = {
	appName: 'CoderScreen',
	emailAndPassword: {
		enabled: true,
	},
	// emailVerification: {
	// 	sendVerificationEmail: async ({ user, url, token }) => {
	// 		console.log('sendVerificationEmail', { user, url, token });
	// 		// Send verification email to user
	// 	},
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	expiresIn: 3600, // 1 hour
	// },
	databaseHooks: {
		session: {
			create: {
				before: async (session, context) => {
					// get first organization id
					const member = await db
						.select()
						.from(schema.member)
						.where(eq(schema.member.userId, session.userId))
						.limit(1)
						.then((res) => res[0]);

					const activeOrganizationId = member?.organizationId;

					return {
						data: {
							...session,
							activeOrganizationId,
						},
					};
				},
			},
		},
	},
	user: {
		additionalFields: {
			isOnboarded: {
				defaultValue: 'false',
				type: 'boolean',
				required: true,
				input: false,
				transform: {
					input: (value) => value === 'true',
				},
			},
			persona: {
				type: 'string',
				required: false,
				input: true,
			},
		},
	},
	plugins: [
		organization({
			organizationCreation: {
				afterCreate: async ({ user: orgUser }) => {
					// update user to set isOnboarded to true
					await db.update(schema.user).set({ isOnboarded: true }).where(eq(schema.user.id, orgUser.id));
				},
			},
		}),
	],
} satisfies BetterAuthOptions;

export const auth: ReturnType<typeof betterAuth<typeof betterAuthConfig>> = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	...betterAuthConfig,
});
