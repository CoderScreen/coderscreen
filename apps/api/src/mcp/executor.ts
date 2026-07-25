import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpProps } from './agent';
import { TOOLS } from './tools';

/**
 * Registers every tool in the registry on the MCP server. Each tool is a thin
 * bridge: it validates args (via the SDK, against the tool's `input` shape),
 * calls the corresponding `/v1` endpoint with the caller's API key, and returns
 * the raw JSON. `getProps` is read at call time so the caller's key/base URL are
 * always current regardless of when the agent hydrated its props.
 */
export const registerTools = (server: McpServer, getProps: () => McpProps | undefined): void => {
  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.input },
      // args are validated by the SDK against inputSchema before this runs
      (async (args: Record<string, unknown>) => {
        const props = getProps();
        if (!props) {
          return {
            content: [{ type: 'text' as const, text: 'Not authenticated' }],
            isError: true,
          };
        }

        const { method, path, body } = tool.request(args ?? {});
        const res = await fetch(`${props.baseUrl}/v1${path}`, {
          method,
          headers: {
            authorization: `Bearer ${props.apiKey}`,
            'content-type': 'application/json',
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });

        const text = await res.text();
        if (!res.ok) {
          return {
            content: [{ type: 'text' as const, text: `Error ${res.status}: ${text}` }],
            isError: true,
          };
        }
        return { content: [{ type: 'text' as const, text }] };
        // biome-ignore lint/suspicious/noExplicitAny: registerTool's generic callback type
      }) as any
    );
  }
};
