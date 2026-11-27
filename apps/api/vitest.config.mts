import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests cover plain modules in Node. Workers-only code (Durable Objects,
// containers) isn't exercised here. Integration tests under
// test/integration need TEST_DATABASE_URL pointing at a scratch Postgres.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
  },
});
