/**
 * vscode-jsonrpc writes a message as two frames and does not await the second.
 * If the socket closes between them (the editor leaves the room, or the
 * language server drops the connection), that write rejects with
 * "WebSocket is not open", and the LSP transport never catches the promise.
 *
 * Once the socket is closing, report it as still open and drop the bytes.
 * The session already treats a close as "reconnect on the next edit".
 */
export const installClosedSocketWriteGuard = (socket: WebSocket): void => {
  const descriptor = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'readyState');
  if (!descriptor?.get) return;

  const readReadyState = () => descriptor.get?.call(socket) as number;
  const realSend = socket.send.bind(socket);
  socket.send = ((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (readReadyState() !== WebSocket.OPEN) return;
    realSend(data);
  }) as WebSocket['send'];

  Object.defineProperty(socket, 'readyState', {
    configurable: true,
    get() {
      const real = readReadyState();
      if (real === WebSocket.CLOSING || real === WebSocket.CLOSED) return WebSocket.OPEN;
      return real;
    },
  });
};

/**
 * The language-server transport constructs its WebSocket internally. Install
 * the guard on sockets created while `fn` runs (it only needs to cover the
 * synchronous `new WebSocket` inside `connect()`).
 */
export const runWithGuardedWebSocket = <T>(fn: () => T): T => {
  const NativeWebSocket = globalThis.WebSocket;
  if (!NativeWebSocket) return fn();

  function PatchedWebSocket(
    this: WebSocket,
    url: string | URL,
    protocols?: string | string[]
  ): WebSocket {
    const socket =
      protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url, protocols);
    installClosedSocketWriteGuard(socket);
    return socket;
  }

  PatchedWebSocket.prototype = NativeWebSocket.prototype;
  Object.setPrototypeOf(PatchedWebSocket, NativeWebSocket);

  globalThis.WebSocket = PatchedWebSocket as unknown as typeof WebSocket;
  try {
    return fn();
  } finally {
    globalThis.WebSocket = NativeWebSocket;
  }
};
