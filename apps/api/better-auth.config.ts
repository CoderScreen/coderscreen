import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { betterAuthConfig } from '@/lib/auth';

// @ts-ignore
const { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } = process.env;

const sql = postgres(DATABASE_URL!);
const db = drizzle(sql);

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg' }),
	baseURL: BETTER_AUTH_URL,
	secret: BETTER_AUTH_SECRET,
	...betterAuthConfig,
});
