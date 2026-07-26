import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AppContext } from '@/index';
import { extractApiKey, verifyApiKey } from '@/lib/apiKeyAuth';
import { CoderScreenMcp, McpProps } from './agent';

const MCP_BINDING = 'CODERSCREEN_MCP';

/**
 * Verify the caller's API key and stash it (plus this request's origin) on the
 * execution context's `props`. This is how the agents SDK passes per-connection
 * context to an McpAgent: `McpAgent.serve()` reads `ctx.props` when it spins up
 * the Durable Object (the same channel `@cloudflare/workers-oauth-provider`
 * uses after an OAuth flow). Throws 401 if the key is missing or invalid.
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

  // Only the key and origin are needed; tools re-derive org/user from the key
  // on each /v1 call.
  const props: McpProps = { apiKey: key, baseUrl: new URL(c.req.url).origin };
  c.executionCtx.props = props;
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
