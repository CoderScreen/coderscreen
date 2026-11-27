import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const isCoderScreenHost = (url: string | undefined) => {
  if (!url) return false;
  const { hostname } = new URL(url);
  return hostname === 'coderscreen.com' || hostname.endsWith('.coderscreen.com');
};

// The git SHA tags Sentry events and the uploaded source maps. Cloudflare
// Workers Builds exposes it as WORKERS_CI_COMMIT_SHA.
const sentryRelease = (() => {
  const fromEnv = process.env.SENTRY_RELEASE ?? process.env.WORKERS_CI_COMMIT_SHA?.slice(0, 7);
  if (fromEnv) return fromEnv;
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
})();

// Source maps are only built when they'll be uploaded (and then deleted), so
// they're never served publicly from dist/.
const uploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: uploadSourceMaps ? 'hidden' : false,
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    cloudflare(),
    viteReact(),
    tailwindcss(),
    uploadSourceMaps &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG ?? 'boreal-labs',
        project: process.env.SENTRY_PROJECT ?? 'coderscreen-web',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: sentryRelease || undefined },
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        telemetry: false,
      }),
  ],
  define: {
    'import.meta.env.VITE_APP_URL': JSON.stringify(
      process.env.VITE_APP_URL ?? 'http://localhost:3000'
    ),
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL ?? 'http://localhost:8000'
    ),
    // Browser DSNs are public by design (shipped in the client bundle), so the
    // production value is a safe default for our own deployments. Self-hosted
    // builds get no Sentry unless they set their own DSN; otherwise their
    // users' errors (and emails) would land in our project. Sentry is disabled
    // in dev via MODE.
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(
      process.env.VITE_SENTRY_DSN ??
        (isCoderScreenHost(process.env.VITE_APP_URL)
          ? 'https://d3de88682d569cc42655cfd5bc148001@o4510473855959040.ingest.us.sentry.io/4511725503512576'
          : '')
    ),
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(sentryRelease),
    // Env-var only, no default: PostHog stays off unless the key is set.
    'import.meta.env.VITE_PUBLIC_POSTHOG_KEY': JSON.stringify(
      process.env.VITE_PUBLIC_POSTHOG_KEY ?? ''
    ),
    'import.meta.env.VITE_PUBLIC_POSTHOG_HOST': JSON.stringify(
      process.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    ),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // packages/ui pins an older React, so pnpm gives it its own sonner copy.
    // Without this the <Toaster> from @coderscreen/ui and our toast() calls
    // talk to different stores in the production bundle and no toast renders.
    dedupe: ['sonner'],
  },
});
