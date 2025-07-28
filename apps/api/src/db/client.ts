import { env } from 'node:process';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import postgres from 'postgres';
import { AppContext } from '@/index';

const DATABASE_URL = env.INFISCAL_DATABASE_URL;

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
