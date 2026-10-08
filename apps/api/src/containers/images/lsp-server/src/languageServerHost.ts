import { type ChildProcess, spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  createMessageConnection,
  type MessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-jsonrpc/node.js';
import { LANGUAGE_SERVERS, type LanguageServerId } from './languages.js';
import { SharedLanguageServer } from './sharedLanguageServer.js';

interface RunningServer {
  process: ChildProcess;
  connection: MessageConnection;
  shared: SharedLanguageServer;
}

export interface EditorConnection {
  connection: MessageConnection;
  /** Called if the language server goes away, so the editor can reconnect. */
  close: (reason: string) => void;
}

export interface LanguageServerHostOptions {
  workspaceDir: string;
  /** Stop the language server after it's had no editors for this long. */
  idleShutdownMs: number;
}

/**
 * Owns the language server process for one language. It starts when the
 * first editor connects, is shared by every editor after that, and stops once
 * nobody has been connected for a while so it doesn't hold memory the
 * candidate's code could use.
 */
export class LanguageServerHost {
  readonly #id: LanguageServerId;
  readonly #options: LanguageServerHostOptions;
  readonly #editors = new Set<EditorConnection>();
  #running: RunningServer | undefined;
  #idleTimer: NodeJS.Timeout | undefined;

  constructor(id: LanguageServerId, options: LanguageServerHostOptions) {
    this.#id = id;
    this.#options = options;
  }

  connect(editor: EditorConnection): () => void {
    clearTimeout(this.#idleTimer);
    const { shared } = this.#start();
    const release = shared.connect(editor.connection);
    this.#editors.add(editor);
    editor.connection.listen();

    return () => {
      if (!this.#editors.delete(editor)) return;
      release();
      editor.connection.dispose();
      if (this.#editors.size === 0) {
        this.#idleTimer = setTimeout(() => this.stop(), this.#options.idleShutdownMs);
      }
    };
  }

  stop() {
    clearTimeout(this.#idleTimer);
    this.#running?.process.kill();
  }

  /** Stops the server now, rather than after the idle timeout, if no editor is using it. */
  stopIfUnused() {
    if (this.#editors.size === 0) this.stop();
  }

  #start(): RunningServer {
    if (this.#running) return this.#running;

    const { command, args, env, initializationOptions, settings } = LANGUAGE_SERVERS[this.#id]();
    const child = spawn(command, args, {
      cwd: this.#options.workspaceDir,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    const connection = createMessageConnection(
      new StreamMessageReader(child.stdout),
      new StreamMessageWriter(child.stdin)
    );
    const shared = new SharedLanguageServer(connection, {
      workspaceUri: pathToFileURL(this.#options.workspaceDir).href,
      initializationOptions,
      settings,
    });
    const running = { process: child, connection, shared };

    const onGone = (reason: string) => {
      if (this.#running !== running) return;
      this.#running = undefined;
      shared.dispose();
      connection.dispose();
      // Editors reconnect on their next keystroke and get a fresh server.
      for (const editor of this.#editors) editor.close(reason);
      this.#editors.clear();
    };
    child.on('exit', (code, signal) => {
      console.warn(`[lsp-server] ${this.#id} exited (code ${code}, signal ${signal})`);
      onGone('Language server exited');
    });
    child.on('error', (error) => {
      console.error(`[lsp-server] ${this.#id} failed: ${error.message}`);
      onGone('Language server failed to start');
    });

    connection.listen();
    this.#running = running;
    return running;
  }
}
