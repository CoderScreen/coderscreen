import { Context } from 'hono';
import { AppContext } from '@/index';
import { useAuth } from '@/lib/auth';

export interface ApiKeyIdentity {
  keyId: string;
  userId: string;
  organizationId: string;
}

/** Pull an API key from an `Authorization: Bearer <key>` or `x-api-key` header. */
export const extractApiKey = (ctx: Context<AppContext>): string | undefined => {
  const authHeader = ctx.req.header('authorization');
  const bearer = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : undefined;
  return bearer ?? ctx.req.header('x-api-key');
};

/**
 * Verify an API key with the better-auth apiKey plugin and resolve the org it
 * acts for. Returns null when the key is invalid or not tied to an org.
 *
 * Single source of truth for API-key auth, shared by the REST middleware
 * (apiKey.middleware.ts) and the MCP handler (mcp/handler.ts).
 */
export const verifyApiKey = async (
  ctx: Context<AppContext>,
  key: string
): Promise<ApiKeyIdentity | null> => {
  // The apiKey plugin methods aren't on the widened useAuth return type (the
  // config is annotated as BetterAuthOptions to stay serializable), so narrow
  // the surface we need.
  const api = useAuth(ctx).api as unknown as {
    verifyApiKey: (opts: { body: { key: string } }) => Promise<{
      valid: boolean;
      key: { id: string; userId: string; metadata: unknown } | null;
    }>;
  };

  const { valid, key: apiKey } = await api.verifyApiKey({ body: { key } });
  if (!valid || !apiKey) return null;

  const metadata = (apiKey.metadata ?? {}) as { organizationId?: string };
  if (!metadata.organizationId) return null;

  return {
    keyId: apiKey.id,
    userId: apiKey.userId,
    organizationId: metadata.organizationId,
  };
};
