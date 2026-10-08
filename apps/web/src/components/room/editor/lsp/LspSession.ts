import { LSClient } from '@valtown/codemirror-ls';
import { type LSITransport, LSWebSocketTransport } from '@valtown/codemirror-ls/transport';

/** Matches the room terminal: drop an idle connection so it stops keeping the container awake. */
const IDLE_DISCONNECT_MS = 3 * 60 * 1000;
const MIN_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 60_000;

const WORKSPACE_FOLDER = { uri: 'file:///workspace', name: 'workspace' };

type RequestHandler = (method: string, params: unknown) => unknown;
type NotificationHandler = (method: string, params: unknown) => void;

/**
 * One editor tab's connection to the room's language server.
 *
 * It's the transport for an `LSClient` and wraps @valtown/codemirror-ls's
 * WebSocket transport, which is single-use: once its socket closes it's done.
 * Connections follow the same rules as the room terminal (#36):
 *
 * - Connect only when the editor is being used (focused, or asking for
 *   completions/hovers) in a visible tab, never just because it rendered.
 * - Disconnect after a few idle minutes or when the tab is hidden, and
 *   reconnect on the next interaction.
 * - Back off after failures so a broken server isn't retried on every keystroke.
 *
 * Autocomplete is an extra, so while there's no connection, requests resolve
 * to null (no suggestions) instead of throwing into the editor.
 */
export class LspSession implements LSITransport {
  readonly client: LSClient;

  readonly #url: string;
  #socket: LSWebSocketTransport | null = null;
  #waitingForSocket: ((socket: LSWebSocketTransport) => void)[] = [];
  #initializing = false;
  #idleTimer: ReturnType<typeof setTimeout> | undefined;
  #retryAt = 0;
  #retryDelay = MIN_RETRY_DELAY_MS;
  #disposed = false;

  readonly #requestHandlers = new Set<RequestHandler>();
  readonly #notificationHandlers = new Set<NotificationHandler>();
  readonly #errorHandlers = new Set<(error: unknown) => void>();

  constructor(url: string) {
    this.#url = url;
    this.client = new LSClient({ transport: this, workspaceFolders: [WORKSPACE_FOLDER] });

    // Until it has initialized, LSClient holds requests, and the editor
    // plugins give up on them after 5s by throwing, which CodeMirror reports
    // as an uncaught error. Answer them with "nothing" instead, and treat
    // them as the cue to connect.
    const request = this.client.request.bind(this.client);
    this.client.request = ((method, params) => {
      if (method !== 'initialize') {
        this.activate();
        if (!this.client.ready) return Promise.resolve(null);
      }
      return request(method, params);
    }) as LSClient['request'];

    document.addEventListener('visibilitychange', this.#onVisibilityChange);
  }

  /** Marks the editor as in use: connects if needed and resets the idle timer. */
  activate() {
    if (this.#disposed) return;

    clearTimeout(this.#idleTimer);
    this.#idleTimer = setTimeout(() => this.#disconnect(), IDLE_DISCONNECT_MS);

    if (this.#socket || document.visibilityState !== 'visible' || Date.now() < this.#retryAt) {
      return;
    }
    this.#connect();
  }

  dispose() {
    this.#disposed = true;
    clearTimeout(this.#idleTimer);
    document.removeEventListener('visibilitychange', this.#onVisibilityChange);
    this.#disconnect();
  }

  // LSITransport

  async sendRequest(method: string, params?: unknown): Promise<unknown> {
    if (method === 'initialize') return this.#initialize(params);

    const socket = this.#openSocket();
    if (!socket) return null;
    return socket.sendRequest(method, params).catch(() => null);
  }

  sendNotification(method: string, params?: unknown) {
    // Dropped while disconnected: on reconnect the editors re-send their open
    // documents in full, so nothing is lost.
    this.#openSocket()?.sendNotification(method, params);
  }

  onRequest(handler: RequestHandler) {
    this.#requestHandlers.add(handler);
    return () => this.#requestHandlers.delete(handler);
  }

  onNotification(handler: NotificationHandler) {
    this.#notificationHandlers.add(handler);
    return () => this.#notificationHandlers.delete(handler);
  }

  onError(handler: (error: unknown) => void) {
    this.#errorHandlers.add(handler);
    return () => this.#errorHandlers.delete(handler);
  }

  close() {
    this.dispose();
  }

  // Connection management

  #openSocket() {
    return this.#socket?.connected() ? this.#socket : null;
  }

  /**
   * LSClient sends `initialize` as soon as it's created. Hold it until the
   * editor is actually used and a connection opens, and if the socket drops
   * mid-handshake, try again on the next one.
   */
  async #initialize(params: unknown): Promise<unknown> {
    this.#initializing = true;
    try {
      for (;;) {
        const socket =
          this.#openSocket() ??
          (await new Promise<LSWebSocketTransport>((resolve) => {
            this.#waitingForSocket.push(resolve);
          }));
        try {
          return await socket.sendRequest('initialize', params);
        } catch {
          // Wait for the next connection.
        }
      }
    } finally {
      this.#initializing = false;
    }
  }

  #connect() {
    const socket = new LSWebSocketTransport(this.#url, {
      onWSClose: () => this.#handleClose(socket),
    });
    socket.onRequest((method, params) => {
      for (const handler of this.#requestHandlers) handler(method, params);
    });
    socket.onNotification((method, params) => {
      for (const handler of this.#notificationHandlers) handler(method, params);
    });
    socket.onError((error) => {
      for (const handler of this.#errorHandlers) handler(error);
    });
    this.#socket = socket;

    socket.connect().then(
      () => {
        if (this.#socket !== socket) return;
        this.#retryDelay = MIN_RETRY_DELAY_MS;

        const waiting = this.#waitingForSocket;
        this.#waitingForSocket = [];
        for (const resolve of waiting) resolve(socket);

        // After a reconnect the server may be a fresh process, so initialize
        // again. The editors re-send their documents once it's done.
        if (!this.#initializing) this.client.initialize().catch(() => {});
      },
      // The close handler cleans up and schedules the retry.
      () => {}
    );
  }

  #handleClose(socket: LSWebSocketTransport) {
    if (this.#socket !== socket) return;
    this.#socket = null;
    this.client.ready = false;

    this.#retryAt = Date.now() + this.#retryDelay;
    this.#retryDelay = Math.min(this.#retryDelay * 2, MAX_RETRY_DELAY_MS);
  }

  #disconnect() {
    const socket = this.#socket;
    if (!socket) return;
    this.#socket = null;
    this.client.ready = false;
    // Close the raw socket rather than calling dispose(): the transport's own
    // close handler throws if it's already been disposed.
    socket.connection?.close(1000, 'Editor idle');
  }

  #onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearTimeout(this.#idleTimer);
      this.#disconnect();
    }
  };
}
