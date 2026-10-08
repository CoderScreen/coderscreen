import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { MessageConnection } from 'vscode-jsonrpc';
import {
  type ConfigurationParams,
  type DidChangeTextDocumentParams,
  type DidChangeWatchedFilesParams,
  type DidCloseTextDocumentParams,
  type DidOpenTextDocumentParams,
  FileChangeType,
  type InitializeParams,
  type InitializeResult,
  TextDocumentSyncKind,
  type WorkspaceFolder,
} from 'vscode-languageserver-protocol';

interface SharedDocument {
  languageId: string;
  version: number;
  text: string;
  /** Editors that currently have this document open. */
  editors: Set<symbol>;
}

export interface SharedLanguageServerOptions {
  /** The workspace every editor in the room is editing, e.g. `file:///workspace`. */
  workspaceUri: string;
  /** Whether the file behind a document URI still exists. Injectable for tests. */
  fileExists?: (uri: string) => boolean;
  /** How long after a document closes to check again whether its file was deleted. */
  deletionCheckDelayMs?: number;
}

const fileExistsOnDisk = (uri: string) => {
  if (!uri.startsWith('file://')) return false;
  return fs.existsSync(fileURLToPath(uri));
};

/**
 * One language server process shared by every editor in a room.
 *
 * Each editor gets its own JSON-RPC connection (one per WebSocket), so
 * request ids and responses never cross between editors. What this class adds
 * is making the language server itself safe to share:
 *
 * - It owns the server's startup. The first editor's `initialize` is
 *   forwarded and later editors get the cached result. This class sends
 *   `initialized` itself and holds back every other message until then,
 *   because the TypeScript server crashes on requests that arrive before it's
 *   initialized (which happens when an editor reconnects to a freshly
 *   restarted server).
 * - Every editor sends whole-file updates (we advertise full sync). They share
 *   one version counter per document and exact repeats are dropped, so the
 *   server holds whichever text arrived last. Yjs keeps editors converged, so
 *   that's the current file.
 * - A document stays open until the last editor closes it or disconnects.
 *   When it closes and its file is gone (e.g. a language switch replaced
 *   `main.ts` with `main.js`), the server is told the file was deleted, so
 *   its old contents stop showing up in suggestions.
 * - `shutdown`/`exit` from one editor would stop the server for the whole
 *   room, so they're ignored.
 * - Server-to-client traffic stops here. We only use completions, hover and
 *   signature help, which are plain request/response, so server requests get
 *   default answers and server notifications (diagnostics, logs, progress)
 *   are dropped instead of being sent to every editor.
 */
export class SharedLanguageServer {
  readonly #server: MessageConnection;
  readonly #workspaceFolder: WorkspaceFolder;
  readonly #fileExists: (uri: string) => boolean;
  readonly #deletionCheckDelayMs: number;
  /** Every open document, including ones opened before the server was ready. */
  readonly #documents = new Map<string, SharedDocument>();
  readonly #deletionChecks = new Map<string, NodeJS.Timeout>();
  #initializeResult: Promise<InitializeResult> | undefined;
  #ready = false;

  constructor(
    server: MessageConnection,
    {
      workspaceUri,
      fileExists = fileExistsOnDisk,
      deletionCheckDelayMs = 5_000,
    }: SharedLanguageServerOptions
  ) {
    this.#server = server;
    this.#workspaceFolder = { uri: workspaceUri, name: 'workspace' };
    this.#fileExists = fileExists;
    this.#deletionCheckDelayMs = deletionCheckDelayMs;

    server.onRequest('workspace/configuration', (params: ConfigurationParams) =>
      params.items.map(() => null)
    );
    server.onRequest('workspace/workspaceFolders', () => [this.#workspaceFolder]);
    server.onRequest(() => null);
    server.onNotification(() => {});
  }

  /**
   * Wires up one editor's connection. Returns a function to call when the
   * editor disconnects, which releases the documents it had open.
   */
  connect(client: MessageConnection): () => void {
    const editor = Symbol('editor');

    client.onRequest('initialize', (params: InitializeParams) => this.#initialize(params));
    // Sent by #initialize once the server has answered.
    client.onNotification('initialized', () => {});
    client.onRequest('shutdown', () => null);
    client.onNotification('exit', () => {});
    // Settings are owned by the sandbox, not by whichever editor connected.
    client.onNotification('workspace/didChangeConfiguration', () => {});

    client.onNotification('textDocument/didOpen', ({ textDocument }: DidOpenTextDocumentParams) =>
      this.#open(editor, textDocument.uri, textDocument.languageId, textDocument.text)
    );

    client.onNotification(
      'textDocument/didChange',
      ({ textDocument, contentChanges }: DidChangeTextDocumentParams) => {
        const doc = this.#documents.get(textDocument.uri);
        if (!doc) return;

        // We advertise full sync, so every change carries the whole file. A
        // ranged change would be relative to that editor's last update, not
        // to the text the server holds, so it can't be applied safely.
        const fullText = contentChanges.findLast((change) => !('range' in change));
        if (fullText) this.#sendText(textDocument.uri, doc, fullText.text);
      }
    );

    client.onNotification('textDocument/didClose', ({ textDocument }: DidCloseTextDocumentParams) =>
      this.#release(editor, textDocument.uri)
    );

    client.onRequest(async (method, params, token) => {
      if (!(await this.#waitUntilReady())) return null;
      return this.#server.sendRequest(method, params, token);
    });
    client.onNotification((method, params) => {
      if (this.#ready) this.#notify(method, params);
    });

    return () => {
      for (const uri of this.#documents.keys()) this.#release(editor, uri);
    };
  }

  dispose() {
    for (const timer of this.#deletionChecks.values()) clearTimeout(timer);
    this.#deletionChecks.clear();
    this.#documents.clear();
  }

  #initialize(params: InitializeParams) {
    if (!this.#initializeResult) {
      const result = this.#server
        .sendRequest<InitializeResult>('initialize', {
          ...params,
          // The editors run in browsers, so there's no client process for the
          // server to watch, and the workspace is the sandbox's, not whatever
          // the first editor happened to send.
          processId: null,
          rootUri: this.#workspaceFolder.uri,
          rootPath: undefined,
          workspaceFolders: [this.#workspaceFolder],
        } satisfies InitializeParams)
        .then((result): InitializeResult => {
          this.#notify('initialized', {});
          this.#ready = true;
          for (const [uri, doc] of this.#documents) this.#sendOpen(uri, doc);

          return {
            ...result,
            capabilities: {
              ...result.capabilities,
              textDocumentSync: { openClose: true, change: TextDocumentSyncKind.Full },
            },
          };
        });
      this.#initializeResult = result;
      // Let the next editor retry instead of caching the failure.
      result.catch(() => {
        if (this.#initializeResult === result) this.#initializeResult = undefined;
      });
    }
    return this.#initializeResult;
  }

  /**
   * Resolves once the server is initialized. Resolves false if no editor has
   * started initializing it, or initialization failed: the editor will
   * initialize and ask again.
   */
  async #waitUntilReady() {
    if (this.#ready) return true;
    if (!this.#initializeResult) return false;
    try {
      await this.#initializeResult;
    } catch {
      return false;
    }
    return this.#ready;
  }

  #open(editor: symbol, uri: string, languageId: string, text: string) {
    const existing = this.#documents.get(uri);
    if (existing) {
      existing.editors.add(editor);
      this.#sendText(uri, existing, text);
      return;
    }

    clearTimeout(this.#deletionChecks.get(uri));
    this.#deletionChecks.delete(uri);

    const doc = { languageId, version: 1, text, editors: new Set([editor]) };
    this.#documents.set(uri, doc);
    if (this.#ready) this.#sendOpen(uri, doc);
  }

  #sendOpen(uri: string, { languageId, version, text }: SharedDocument) {
    this.#notify('textDocument/didOpen', {
      textDocument: { uri, languageId, version, text },
    } satisfies DidOpenTextDocumentParams);
  }

  #sendText(uri: string, doc: SharedDocument, text: string) {
    if (text === doc.text) return;
    doc.text = text;
    doc.version += 1;
    if (!this.#ready) return;
    this.#notify('textDocument/didChange', {
      textDocument: { uri, version: doc.version },
      contentChanges: [{ text }],
    } satisfies DidChangeTextDocumentParams);
  }

  #release(editor: symbol, uri: string) {
    const doc = this.#documents.get(uri);
    if (!doc?.editors.delete(editor) || doc.editors.size > 0) return;

    this.#documents.delete(uri);
    if (!this.#ready) return;
    this.#notify('textDocument/didClose', {
      textDocument: { uri },
    } satisfies DidCloseTextDocumentParams);

    // Once a document is closed the server reads the file from disk, and it
    // isn't watching the disk. The room's file sync deletes files from the
    // sandbox shortly after editors drop them, so check now and again later.
    if (this.#reportIfDeleted(uri)) return;
    const timer = setTimeout(() => {
      this.#deletionChecks.delete(uri);
      this.#reportIfDeleted(uri);
    }, this.#deletionCheckDelayMs);
    timer.unref();
    this.#deletionChecks.set(uri, timer);
  }

  #reportIfDeleted(uri: string) {
    if (this.#documents.has(uri) || this.#fileExists(uri)) return false;
    this.#notify('workspace/didChangeWatchedFiles', {
      changes: [{ uri, type: FileChangeType.Deleted }],
    } satisfies DidChangeWatchedFilesParams);
    return true;
  }

  // A rejected notification only means the server connection is going away,
  // and the host tears everything down when it does.
  #notify(method: string, params?: unknown) {
    this.#server.sendNotification(method, params).catch(() => {});
  }
}
