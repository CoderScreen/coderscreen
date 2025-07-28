import * as schema from '@coderscreen/db/user.db';
import { BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// @ts-ignore
const {
  INFISCAL_DATABASE_URL,
  INFISCAL_BETTER_AUTH_URL,
  INFISCAL_BETTER_AUTH_SECRET,
  INFISCAL_GOOGLE_CLIENT_ID,
  INFISCAL_GOOGLE_CLIENT_SECRET,
  INFISCAL_GITHUB_CLIENT_ID,
  INFISCAL_GITHUB_CLIENT_SECRET,
} = process.env;

if (
  !INFISCAL_DATABASE_URL ||
  !INFISCAL_GITHUB_CLIENT_ID ||
  !INFISCAL_GITHUB_CLIENT_SECRET ||
  !INFISCAL_GOOGLE_CLIENT_ID ||
  !INFISCAL_GOOGLE_CLIENT_SECRET
) {
  throw new Error('Missing environment variables for social providers');
}

const sql = postgres(INFISCAL_DATABASE_URL);
const db = drizzle(sql);

export const betterAuthConfig = {
  appName: 'CoderScreen',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: INFISCAL_GITHUB_CLIENT_ID,
      clientSecret: INFISCAL_GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: INFISCAL_GOOGLE_CLIENT_ID,
      clientSecret: INFISCAL_GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
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
  plugins: [organization()],
} satisfies BetterAuthOptions;

export const auth: ReturnType<typeof betterAuth<typeof betterAuthConfig>> = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: INFISCAL_BETTER_AUTH_URL,
  secret: INFISCAL_BETTER_AUTH_SECRET,
  ...betterAuthConfig,
});
