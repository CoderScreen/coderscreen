import { readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LSWebSocketTransport } from '@valtown/codemirror-ls/transport';
import { afterEach, describe, expect, it } from 'vitest';
import { runWithGuardedWebSocket } from './lspSocketGuard';

// `ws` is not a web dependency; the API workspace pulls it in. Use that copy
// so the test speaks a real close handshake.
const loadWebSocketServer = () => {
  const pnpm = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../../../node_modules/.pnpm'
  );
  const folder = readdirSync(pnpm).find((name) => name.startsWith('ws@'));
  if (!folder) throw new Error('ws package not installed');
  const require = createRequire(import.meta.url);
  const ws = require(join(pnpm, folder, 'node_modules/ws')) as {
    WebSocketServer: new (options: {
      server: ReturnType<typeof createServer>;
    }) => {
      on(
        event: 'connection',
        listener: (socket: { on(event: 'message', cb: () => void): void }) => void
      ): void;
      close: () => void;
    };
  };
  return ws.WebSocketServer;
};

const startServer = async () => {
  const WebSocketServer = loadWebSocketServer();
  const httpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer });
  let frames = 0;
  wss.on('connection', (socket) => {
    socket.on('message', () => {
      frames += 1;
    });
  });
  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  const address = httpServer.address();
  if (!address || typeof address === 'string') throw new Error('server has no port');

  return {
    url: `ws://127.0.0.1:${address.port}`,
    frames: () => frames,
    close: () => {
      wss.close();
      httpServer.closeAllConnections?.();
      return new Promise<void>((resolve) => httpServer.close(() => resolve()));
    },
  };
};

const captureRejections = async (run: () => Promise<void>) => {
  const reasons: string[] = [];
  const onUnhandled = (reason: unknown) => {
    reasons.push(reason instanceof Error ? reason.message : String(reason));
  };
  process.on('unhandledRejection', onUnhandled);
  try {
    await run();
    // The body write rejects on a later turn than close().
    await new Promise((resolve) => setTimeout(resolve, 50));
    return reasons;
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
};

const connectTransport = (url: string, guarded: boolean) => {
  let closed = false;
  const transport = new LSWebSocketTransport(url, {
    onWSClose: () => {
      closed = true;
    },
  });
  const open = () => transport.connect();
  const connected = guarded ? runWithGuardedWebSocket(open) : open();
  return { transport, connected, didClose: () => closed };
};

describe('lsp socket write guard', () => {
  let server: Awaited<ReturnType<typeof startServer>> | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('rejects unhandled when the language server socket closes mid-write', async () => {
    const current = await startServer();
    server = current;
    const reasons = await captureRejections(async () => {
      const { transport, connected } = connectTransport(current.url, false);
      await connected;
      transport.sendNotification('textDocument/didChange', { text: 'draft' });
      transport.connection?.close();
    });

    expect(reasons).toContain('WebSocket is not open');
  });

  it('drops the in-flight write when the socket closes and still delivers while open', async () => {
    const current = await startServer();
    server = current;
    const reasons = await captureRejections(async () => {
      const { transport, connected, didClose } = connectTransport(current.url, true);
      await connected;
      transport.sendNotification('initialized', {});
      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(current.frames()).toBeGreaterThan(0);

      transport.sendNotification('textDocument/didChange', { text: 'draft' });
      transport.connection?.close();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(didClose()).toBe(true);
    });

    expect(reasons).toEqual([]);
  });
});
