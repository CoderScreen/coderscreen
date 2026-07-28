import type { Logger } from 'drizzle-orm';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import postgres from 'postgres';
import { AppContext } from '@/index';

// Logs each SQL statement in non-prod (params omitted — they can hold PII).
class QueryLogger implements Logger {
  logQuery(query: string): void {
    console.log(`[db] ${query}`);
  }
}

export const useDb = (ctx: Context<AppContext>): PostgresJsDatabase => {
  const storedDb: PostgresJsDatabase | undefined = ctx.get('db');

  if (storedDb) {
    return storedDb;
  }

  const connectionString = ctx.env.HYPERDRIVE?.connectionString ?? ctx.env.INFISCAL_DATABASE_URL;

  const sql = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });

  const newDb = drizzle(sql, {
    logger: ctx.env.NODE_ENV !== 'production' ? new QueryLogger() : undefined,
  });

  ctx.set('db', newDb);

  return newDb;
};
