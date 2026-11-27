import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { ensureTestDatabase, testDatabaseUrl } from './test/api/testDatabase';

// API tests: the real Worker (routes, auth, middleware, services) running in
// workerd, called over HTTP, backed by a real Postgres. See test/api/README.md.

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// wrangler loads .dev.vars from next to the config file. Pointing the pool at a
// copy keeps real secrets out of tests: every value they see is set below.
const testConfigDir = here('./.wrangler/test');
mkdirSync(testConfigDir, { recursive: true });
copyFileSync(here('./wrangler.jsonc'), `${testConfigDir}/wrangler.jsonc`);

// Prepared here rather than in a globalSetup file: vitest rewrites process.env
// in those, so they never see TEST_DATABASE_URL and would set up a different
// database from the one the Worker connects to.
ensureTestDatabase();

// wrangler reads this when it builds the HYPERDRIVE binding.
process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE = testDatabaseUrl;

export default defineWorkersConfig({
  resolve: { alias: { '@': here('./src') } },
  test: {
    include: ['test/api/**/*.spec.ts'],
    setupFiles: ['test/api/setup.ts'],
    // The Worker logs every SQL statement outside production; keep failures readable.
    onConsoleLog: (log) => !log.startsWith('[db]'),
    deps: {
      optimizer: {
        // Their ESM imports don't resolve inside the pool unless pre-bundled.
        ssr: { enabled: true, include: ['@cloudflare/sandbox', '@cloudflare/containers'] },
      },
    },
    poolOptions: {
      workers: {
        main: './src/index.ts',
        singleWorker: true,
        wrangler: { configPath: `${testConfigDir}/wrangler.jsonc` },
        miniflare: {
          bindings: {
            // development: emails are logged, Sentry is off, no Stripe calls at boot
            NODE_ENV: 'development',
            SENTRY_DSN: '',
            FE_APP_URL: 'http://localhost:3000',
            FREE_PLAN_ID: 'free',
            INFISCAL_DATABASE_URL: testDatabaseUrl,
            INFISCAL_BETTER_AUTH_URL: 'http://api.test/auth',
            INFISCAL_BETTER_AUTH_SECRET: 'api-tests-only-better-auth-secret-0000',
            INFISCAL_RESEND_API_KEY: 're_test_disabled',
            INFISCAL_STRIPE_PUBLISHABLE_KEY: 'pk_test_disabled',
            INFISCAL_STRIPE_SECRET_KEY: 'sk_test_disabled',
            INFISCAL_STRIPE_WEBHOOK_SECRET: 'whsec_test_disabled',
            INFISCAL_OPENROUTER_API_KEY: '',
            INFISCAL_GOOGLE_CLIENT_ID: 'test',
            INFISCAL_GOOGLE_CLIENT_SECRET: 'test',
            INFISCAL_GITHUB_CLIENT_ID: 'test',
            INFISCAL_GITHUB_CLIENT_SECRET: 'test',
          },
        },
      },
    },
  },
});
