import type { CloudflareOptions } from '@sentry/cloudflare';

/**
 * Shared Sentry config used by both the Worker (`withSentry`) and every Durable
 * Object (`instrumentDurableObjectWithSentry`). Kept in one place so tracing,
 * environment tagging, and the dev opt-out stay consistent across entrypoints.
 *
 * Disabled when `NODE_ENV === 'development'` (set via `.dev.vars`) so local
 * errors don't get reported to Sentry. `SENTRY_DSN` is provided as a plain var
 * in `wrangler.jsonc` for the deployed environments.
 */
export function getSentryOptions(env: Env): CloudflareOptions {
  return {
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    enabled: env.NODE_ENV !== 'development' && Boolean(env.SENTRY_DSN),
    // Capture a sample of traces for performance monitoring. Tune as needed.
    tracesSampleRate: 0.1,
    sendDefaultPii: true,
  };
}
