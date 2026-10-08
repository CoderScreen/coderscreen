/**
 * WebSocket server for editor autocomplete, run inside each room's sandbox.
 *
 * The API worker proxies `/rooms/:roomId/public/lsp?language=<id>` here with
 * `sandbox.wsConnect`. The sandbox belongs to a single room, so every editor
 * that connects for a language shares one language server process (see
 * sharedLanguageServer.ts).
 */
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { LanguageServerHost } from './languageServerHost.js';
import { isLanguageServerId, type LanguageServerId } from './languages.js';
import { createWebSocketMessageConnection } from './webSocketConnection.js';

const PORT = Number(process.env.LSP_PORT ?? 5005);
const WORKSPACE_DIR = process.env.LSP_WORKSPACE_DIR ?? '/workspace';
const IDLE_SHUTDOWN_MS = 10 * 60 * 1000;
// "Service restart": tells the editor it can reconnect.
const CLOSE_SERVER_GONE = 1012;

const hosts = new Map<LanguageServerId, LanguageServerHost>();

const getHost = (id: LanguageServerId) => {
  let host = hosts.get(id);
  if (!host) {
    host = new LanguageServerHost(id, {
      workspaceDir: WORKSPACE_DIR,
      idleShutdownMs: IDLE_SHUTDOWN_MS,
    });
    hosts.set(id, host);
  }
  return host;
};

const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200).end('ok');
    return;
  }
  res.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
  const language = new URL(req.url ?? '/', 'http://localhost').searchParams.get('language');
  if (!language || !isLanguageServerId(language)) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    const disconnect = getHost(language).connect({
      connection: createWebSocketMessageConnection(ws),
      close: (reason) => ws.close(CLOSE_SERVER_GONE, reason),
    });
    ws.on('close', disconnect);
    ws.on('error', disconnect);
  });
});

const shutdown = () => {
  for (const host of hosts.values()) host.stop();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[lsp-server] listening on ${PORT}`);
});
