import type { CloudflareOptions } from '@sentry/cloudflare';

/**
 * Shared Sentry config used by both the Worker (`withSentry`) and every Durable
 * Object (`instrumentDurableObjectWithSentry`). Kept in one place so tracing,
 * environment tagging, and the dev opt-out stay consistent across entrypoints.
 *
 * Disabled when `NODE_ENV === 'development'` (set via `.dev.vars`) so local
 * errors don't get reported to Sentry. `SENTRY_DSN` is provided as a plain var
 * in `wrangler.jsonc` for the deployed environments. `SENTRY_RELEASE` is set
 * by `scripts/deploy.sh` to the git SHA, matching the uploaded source maps.
 */
export function getSentryOptions(env: Env): CloudflareOptions {
  return {
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: (env as { SENTRY_RELEASE?: string }).SENTRY_RELEASE,
    enabled: env.NODE_ENV !== 'development' && Boolean(env.SENTRY_DSN),
    tracesSampler: ({ name }) => traceSampleRate(name),
    // Users are identified by their opaque id only (see auth middleware); no
    // emails, IPs, cookies or request bodies.
    sendDefaultPii: false,
  };
}

/**
 * Every HTTP request is traced so 5xx and latency monitors have enough data at
 * our volume. Websocket message and close events are two thirds of all
 * transactions and say little, so they're kept at 1%.
 */
export function traceSampleRate(transactionName: string): number {
  return transactionName.startsWith('webSocket') ? 0.01 : 1;
}
