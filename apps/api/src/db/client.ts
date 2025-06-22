import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AppContext } from '@/index';
import { Context } from 'hono';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

export const useDb = (ctx: Context<AppContext>) => {
	const storedDb: PostgresJsDatabase | undefined = ctx.get('db');

	if (storedDb) {
		return storedDb;
	}

	const sql = postgres(DATABASE_URL);
	const newDb = drizzle(sql);

	ctx.set('db', newDb);

	return newDb;
};
