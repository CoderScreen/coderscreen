import { PassThrough, Writable } from 'node:stream';
import {
  createMessageConnection,
  type MessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-jsonrpc/node.js';
import type { RawData, WebSocket } from 'ws';

// Cloudflare limits WebSocket messages to 1 MiB. LSP messages carry a
// Content-Length header, so the editor reassembles them across frames.
const MAX_FRAME_BYTES = 256 * 1024;

const toBuffer = (data: RawData) => {
  if (Buffer.isBuffer(data)) return data;
  if (Array.isArray(data)) return Buffer.concat(data);
  return Buffer.from(data);
};

/**
 * Speaks LSP over a WebSocket the way @valtown/codemirror-ls does: the raw
 * stdio byte stream (headers included) in binary frames, which may split or
 * join messages arbitrarily.
 */
export function createWebSocketMessageConnection(ws: WebSocket): MessageConnection {
  const inbound = new PassThrough();
  ws.on('message', (data) => inbound.write(toBuffer(data)));
  ws.on('close', () => inbound.end());

  const outbound = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      if (ws.readyState === ws.OPEN) {
        for (let offset = 0; offset < chunk.length; offset += MAX_FRAME_BYTES) {
          ws.send(chunk.subarray(offset, offset + MAX_FRAME_BYTES));
        }
      }
      callback();
    },
  });

  return createMessageConnection(
    new StreamMessageReader(inbound),
    new StreamMessageWriter(outbound)
  );
}
