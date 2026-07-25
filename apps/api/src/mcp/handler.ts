import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AppContext } from '@/index';
import { extractApiKey, verifyApiKey } from '@/lib/apiKeyAuth';
import { CoderScreenMcp } from './agent';

const MCP_BINDING = 'CODERSCREEN_MCP';

/**
 * Verify the caller's API key and stash the identity (plus the raw key and this
 * request's origin) on the execution context so the MCP Durable Object can call
 * `/v1` on the caller's behalf. Throws 401 if the key is missing or invalid.
 */
const authenticate = async (c: Context<AppContext>): Promise<void> => {
  const key = extractApiKey(c);
  if (!key) {
    throw new HTTPException(401, {
      message: 'Missing API key. Provide it as "Authorization: Bearer <key>".',
    });
  }

  const identity = await verifyApiKey(c, key);
  if (!identity) {
    throw new HTTPException(401, { message: 'Invalid API key' });
  }

  (c.executionCtx as unknown as { props: unknown }).props = {
    apiKey: key,
    organizationId: identity.organizationId,
    userId: identity.userId,
    baseUrl: new URL(c.req.url).origin,
  };
};

/** Streamable HTTP transport (recommended). Single endpoint at /mcp. */
export const handleMcpStreamable = async (c: Context<AppContext>): Promise<Response> => {
  await authenticate(c);
  return CoderScreenMcp.serve('/mcp', { binding: MCP_BINDING }).fetch(
    c.req.raw,
    c.env,
    c.executionCtx
  );
};

/** Legacy SSE transport, for clients that don't support streamable HTTP yet. */
export const handleMcpSSE = async (c: Context<AppContext>): Promise<Response> => {
  await authenticate(c);
  return CoderScreenMcp.serveSSE('/sse', { binding: MCP_BINDING }).fetch(
    c.req.raw,
    c.env,
    c.executionCtx
  );
};
