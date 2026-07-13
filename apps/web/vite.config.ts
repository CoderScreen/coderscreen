import { resolve } from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    cloudflare(),
    viteReact(),
    tailwindcss(),
  ],
  define: {
    'import.meta.env.VITE_APP_URL': JSON.stringify(
      process.env.VITE_APP_URL ?? 'http://localhost:3000'
    ),
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL ?? 'http://localhost:8000'
    ),
    // Browser DSNs are public by design (shipped in the client bundle), so the
    // production value is a safe default. Sentry is disabled in dev via MODE.
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(
      process.env.VITE_SENTRY_DSN ??
        'https://d3de88682d569cc42655cfd5bc148001@o4510473855959040.ingest.us.sentry.io/4511725503512576'
    ),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
