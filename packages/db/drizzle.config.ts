import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './dist/schemas/**/*.db.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
