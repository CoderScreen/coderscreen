import * as Sentry from '@sentry/cloudflare';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { AppContext } from '@/index';
import { extractApiKey, verifyApiKey } from '@/lib/apiKeyAuth';

/**
 * Auth for the public `/v1` API. Reads an API key from the `Authorization:
 * Bearer <key>` header (or `x-api-key`), verifies it, and rebuilds the tenant
 * context (`user` + `session`) from the key so downstream services keep working
 * through `getSession(ctx)` unchanged. Keys only work on the public surface,
 * never against the cookie-authed internal API.
 */
export const apiKeyMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
  const key = extractApiKey(ctx);

  if (!key) {
    throw new HTTPException(401, {
      message: 'Missing API key. Provide it as "Authorization: Bearer <key>".',
    });
  }

  const identity = await verifyApiKey(ctx, key);

  if (!identity) {
    throw new HTTPException(401, { message: 'Invalid API key' });
  }

  // Per-key rate limit via the Cloudflare Rate Limiting binding. Limit is per
  // Cloudflare location and eventually consistent (see wrangler.jsonc).
  const { success } = await ctx.env.API_RATE_LIMITER.limit({ key: identity.keyId });
  if (!success) {
    throw new HTTPException(429, {
      message: 'Rate limit exceeded. Slow down and retry shortly.',
    });
  }

  // Minimal shapes: downstream services only read `user.id` and
  // `session.activeOrganizationId` via getSession(). The key acts for the org;
  // the acting user is the key's creator, used only for row attribution.
  // @ts-expect-error partial user is sufficient for the code paths /v1 exposes
  ctx.set('user', { id: identity.createdBy });
  // @ts-expect-error partial session is sufficient for getSession()
  ctx.set('session', { activeOrganizationId: identity.organizationId });

  Sentry.setUser({ id: identity.createdBy });
  Sentry.setTag('apiKeyId', identity.keyId);
  Sentry.setTag('organizationId', identity.organizationId);

  return next();
});
