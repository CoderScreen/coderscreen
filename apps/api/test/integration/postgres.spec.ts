import postgres from 'postgres';
import { beforeAll, describe, expect, it } from 'vitest';
import { checkHealth, pingPostgres } from '@/lib/health';

// Runs against a throwaway local Postgres, never a shared database:
//   docker run --rm -d -p 55471:5432 -e POSTGRES_PASSWORD=test \
//     -e POSTGRES_INITDB_ARGS=--auth=scram-sha-256 postgres:16
//   TEST_DATABASE_URL=postgres://postgres:test@localhost:55471/postgres pnpm test
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('pingPostgres against a scratch database', () => {
  beforeAll(async () => {
    const sql = postgres(url as string, { max: 1 });
    await sql`select 1`;
    await sql.end();
  });

  it('succeeds with the right credentials', async () => {
    await expect(pingPostgres(url as string)).resolves.toBeUndefined();
    await expect(checkHealth(() => pingPostgres(url as string))).resolves.toEqual({ ok: true });
  });

  it('fails with a wrong password, like the 2026-10-23 rotation', async () => {
    const wrong = new URL(url as string);
    wrong.password = 'not-the-password';
    await expect(pingPostgres(wrong.toString())).rejects.toThrow(/password authentication failed/);
  });

  it('fails fast when nothing is listening', async () => {
    const dead = new URL(url as string);
    dead.port = '1';
    const started = Date.now();
    await expect(pingPostgres(dead.toString(), 1000)).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(3000);
  });
});
