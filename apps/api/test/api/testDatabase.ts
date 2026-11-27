import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node-side setup for the API test database, run from vitest.api.config.mts
// before any test: make sure Postgres is up and has the current schema.

const CONTAINER = 'coderscreen-test-pg';
const PORT = 55434;

/** TEST_DATABASE_URL if set (CI), otherwise a Docker Postgres this suite manages. */
export const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? `postgres://postgres:test@localhost:${PORT}/postgres`;

const docker = (...args: string[]) =>
  execFileSync('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();

export function ensureTestDatabase() {
  if (!process.env.TEST_DATABASE_URL) {
    try {
      docker('info');
    } catch {
      throw new Error(
        'API tests need Postgres. Start Docker (the suite runs its own container) or set TEST_DATABASE_URL.'
      );
    }

    const running = (() => {
      try {
        return docker('inspect', '-f', '{{.State.Running}}', CONTAINER) === 'true';
      } catch {
        return null;
      }
    })();
    if (running === null) {
      // tmpfs: the data is throwaway, and it's faster than a volume.
      docker(
        'run',
        '-d',
        '--name',
        CONTAINER,
        '-p',
        `${PORT}:5432`,
        '-e',
        'POSTGRES_PASSWORD=test',
        '--tmpfs',
        '/var/lib/postgresql/data',
        'postgres:16'
      );
    } else if (!running) {
      docker('start', CONTAINER);
    }

    for (let i = 0; i < 30; i++) {
      try {
        docker('exec', CONTAINER, 'pg_isready', '-q', '-U', 'postgres');
        break;
      } catch {
        execFileSync('sleep', ['1']);
      }
    }
  }

  // The same migrations production runs, so a broken migration fails here first.
  const dbPackage = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../packages/db');
  execFileSync(`${dbPackage}/node_modules/.bin/drizzle-kit`, ['migrate'], {
    cwd: dbPackage,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const { hostname, port } = new URL(testDatabaseUrl);
  const source = process.env.TEST_DATABASE_URL
    ? 'TEST_DATABASE_URL'
    : `Docker container ${CONTAINER}`;
  console.log(`[api tests] Postgres at ${hostname}:${port || 5432} (${source}), migrated`);
}
