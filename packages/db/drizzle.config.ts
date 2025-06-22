import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

const result = dotenv.config({
  path: __dirname + '/.env',
});

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/**/*.db.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
