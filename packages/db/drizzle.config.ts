import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: path.join(__dirname, '.env'),
});

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/*.db.ts',
  out: './drizzle',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
