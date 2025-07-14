import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth, BetterAuthOptions, User } from 'better-auth';
import { organization } from 'better-auth/plugins';
import * as schema from '@coderscreen/db/user.db';
import { eq } from 'drizzle-orm';

// @ts-ignore
const {
  DATABASE_URL,
  BETTER_AUTH_URL,
  BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing environment variables for social providers');
}

const sql = postgres(DATABASE_URL!);
const db = drizzle(sql);

export const betterAuthConfig = {
  appName: 'CoderScreen',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  ...betterAuthConfig,
});
