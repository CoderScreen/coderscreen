import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { registerTools } from './executor';

/**
 * Per-connection context, populated by the MCP handler after it verifies the
 * caller's API key. Tools call `/v1` with `apiKey` against `baseUrl`; the org
 * and acting user are re-derived server-side from the key on each `/v1` call,
 * so nothing else needs to be stashed here. Declared as a type alias (not an
 * interface) so it satisfies McpAgent's `Record<string, unknown>` props
 * constraint without an explicit index signature.
 */
export type McpProps = {
  apiKey: string;
  baseUrl: string;
};

/**
 * Hosted MCP server (Durable Object) that wraps the public `/v1` API. Tool
 * definitions live in tools.ts; this class only wires them onto the server.
 */
export class CoderScreenMcp extends McpAgent<Env, unknown, McpProps> {
  server = new McpServer({ name: 'coderscreen', version: '1.0.0' });

  async init(): Promise<void> {
    registerTools(this.server, () => this.props);
  }
}
