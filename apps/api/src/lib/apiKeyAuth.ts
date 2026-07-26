import { apikey } from '@coderscreen/db/apikey.db';
import { eq, sql } from 'drizzle-orm';
import { Context } from 'hono';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';

export interface ApiKeyIdentity {
  keyId: string;
  organizationId: string;
  // The user who created the key. Used only to attribute API-created resources
  // (e.g. rooms). The key itself acts for the organization.
  createdBy: string;
}

const KEY_PREFIX = 'cs';
// Random part length. 32 chars of the id alphabet is ~190 bits of entropy.
const KEY_RANDOM_LENGTH = 32;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** SHA-256 hex digest, used to store/look up keys without persisting plaintext. */
export const hashApiKey = async (key: string): Promise<string> => {
  const data = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/** Cryptographically-random `cs_<random>` key plus the bits we persist. */
export const generateApiKey = async (): Promise<{
  key: string;
  keyHash: string;
  prefix: string;
  start: string;
}> => {
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_RANDOM_LENGTH));
  const random = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  const key = `${KEY_PREFIX}_${random}`;
  return {
    key,
    keyHash: await hashApiKey(key),
    prefix: KEY_PREFIX,
    // Enough to disambiguate in the UI without revealing the secret.
    start: key.slice(0, KEY_PREFIX.length + 1 + 6),
  };
};

/** Pull an API key from an `Authorization: Bearer <key>` or `x-api-key` header. */
export const extractApiKey = (ctx: Context<AppContext>): string | undefined => {
  const authHeader = ctx.req.header('authorization');
  const bearer = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : undefined;
  return bearer ?? ctx.req.header('x-api-key');
};

/**
 * Verify an API key against the apikey table and resolve the org it acts for.
 * Returns null when the key is unknown, disabled, or expired.
 *
 * Single source of truth for API-key auth, shared by the REST middleware
 * (apiKey.middleware.ts) and the MCP handler (mcp/handler.ts).
 */
export const verifyApiKey = async (
  ctx: Context<AppContext>,
  key: string
): Promise<ApiKeyIdentity | null> => {
  const db = useDb(ctx);
  const keyHash = await hashApiKey(key);

  const row = await db
    .select({
      id: apikey.id,
      createdBy: apikey.createdBy,
      organizationId: apikey.organizationId,
      enabled: apikey.enabled,
      expiresAt: apikey.expiresAt,
    })
    .from(apikey)
    .where(eq(apikey.keyHash, keyHash))
    .then((rows) => rows[0] ?? null);

  if (!row || !row.enabled) return null;
  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return null;

  // Best-effort usage tracking; never block the request (or fail auth) on it.
  const trackUsage = db
    .update(apikey)
    .set({ lastRequest: sql`now()`, requestCount: sql`${apikey.requestCount} + 1` })
    .where(eq(apikey.id, row.id))
    .then(() => undefined)
    .catch(() => undefined);
  try {
    ctx.executionCtx.waitUntil(trackUsage);
  } catch {
    // No execution context (e.g. certain test/runtime paths) - fire and forget.
    void trackUsage;
  }

  return {
    keyId: row.id,
    organizationId: row.organizationId,
    createdBy: row.createdBy,
  };
};
