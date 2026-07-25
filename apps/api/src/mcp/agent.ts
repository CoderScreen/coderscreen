import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { registerTools } from './executor';

/**
 * Per-connection context, populated by the MCP handler after it verifies the
 * caller's API key. Tools use `apiKey` + `baseUrl` to call `/v1` on the
 * caller's behalf.
 */
export interface McpProps {
  apiKey: string;
  organizationId: string;
  userId: string;
  baseUrl: string;
  [key: string]: unknown;
}

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
