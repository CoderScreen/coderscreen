/** biome-ignore-all lint/suspicious/noExplicitAny: assertions read arbitrary LSP payloads */
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  createMessageConnection,
  type MessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-jsonrpc/node.js';
import { SharedLanguageServer } from './sharedLanguageServer.ts';

const WORKSPACE = 'file:///workspace';
const MAIN_TS = 'file:///workspace/main.ts';
const MAIN_JS = 'file:///workspace/main.js';
const DELETION_CHECK_MS = 20;

interface Received {
  method: string;
  params: any;
}

const connectionPair = (): [MessageConnection, MessageConnection] => {
  const aToB = new PassThrough();
  const bToA = new PassThrough();
  return [
    createMessageConnection(new StreamMessageReader(bToA), new StreamMessageWriter(aToB)),
    createMessageConnection(new StreamMessageReader(aToB), new StreamMessageWriter(bToA)),
  ];
};

describe('SharedLanguageServer', () => {
  let shared: SharedLanguageServer;
  let languageServer: MessageConnection;
  let received: Received[];
  let initializeCalls: any[];
  let existingFiles: Set<string>;
  let connections: MessageConnection[];

  /**
   * An editor connected to the shared server, like one browser tab. By
   * default it initializes first, as the real editor client does.
   */
  const connectEditor = async ({ initialize = true } = {}) => {
    const [editor, bridgeSide] = connectionPair();
    const notifications: Received[] = [];
    editor.onNotification((method, params) => notifications.push({ method, params }));
    const disconnect = shared.connect(bridgeSide);
    editor.listen();
    bridgeSide.listen();
    connections.push(editor, bridgeSide);
    if (initialize) await editor.sendRequest('initialize', { capabilities: {} });

    return {
      notifications,
      disconnect,
      request: (method: string, params?: unknown) => editor.sendRequest(method, params),
      notify: (method: string, params?: unknown) => editor.sendNotification(method, params),
      open: (text: string, uri = MAIN_TS) =>
        editor.sendNotification('textDocument/didOpen', {
          textDocument: { uri, languageId: 'typescript', version: 1, text },
        }),
      change: (text: string, version = 1, uri = MAIN_TS) =>
        editor.sendNotification('textDocument/didChange', {
          textDocument: { uri, version },
          contentChanges: [{ text }],
        }),
      close: (uri = MAIN_TS) =>
        editor.sendNotification('textDocument/didClose', { textDocument: { uri } }),
      // Requests travel the same stream as notifications, so once a round
      // trip completes, everything this editor sent before it has arrived.
      flush: () => editor.sendRequest('test/ping'),
    };
  };

  const serverNotifications = (method: string) =>
    received.filter((message) => message.method === method).map((message) => message.params);

  beforeEach(() => {
    received = [];
    initializeCalls = [];
    existingFiles = new Set([MAIN_TS]);
    connections = [];

    const [bridgeServerSide, serverSide] = connectionPair();
    languageServer = serverSide;
    connections.push(bridgeServerSide, serverSide);

    languageServer.onRequest('initialize', (params) => {
      initializeCalls.push(params);
      return { capabilities: { textDocumentSync: 2, hoverProvider: true } };
    });
    languageServer.onRequest('test/ping', () => 'pong');
    languageServer.onRequest('textDocument/hover', (params) => ({
      contents: `hover at ${params.position.line}:${params.position.character}`,
    }));
    languageServer.onNotification((method, params) => received.push({ method, params }));

    shared = new SharedLanguageServer(bridgeServerSide, {
      workspaceUri: WORKSPACE,
      fileExists: (uri) => existingFiles.has(uri),
      deletionCheckDelayMs: DELETION_CHECK_MS,
    });
    bridgeServerSide.listen();
    languageServer.listen();
  });

  afterEach(() => {
    shared.dispose();
    for (const connection of connections) connection.dispose();
  });

  describe('initialization', () => {
    it('initializes the server once and gives every editor the same result', async () => {
      const a = await connectEditor({ initialize: false });
      const b = await connectEditor({ initialize: false });

      const [resultA, resultB] = await Promise.all([
        a.request('initialize', { processId: 1, capabilities: {} }),
        b.request('initialize', { processId: 2, capabilities: {} }),
      ]);

      assert.equal(initializeCalls.length, 1);
      assert.deepEqual(resultA, resultB);
    });

    it('points the server at the sandbox workspace with no client process', async () => {
      const a = await connectEditor({ initialize: false });
      await a.request('initialize', {
        processId: 123,
        rootUri: 'file:///somewhere-else',
        workspaceFolders: [{ uri: 'file:///somewhere-else', name: 'x' }],
        capabilities: {},
      });

      const [params] = initializeCalls;
      assert.equal(params.processId, null);
      assert.equal(params.rootUri, WORKSPACE);
      assert.deepEqual(params.workspaceFolders, [{ uri: WORKSPACE, name: 'workspace' }]);
    });

    it('tells editors to send whole-file updates', async () => {
      const a = await connectEditor({ initialize: false });
      const result: any = await a.request('initialize', { capabilities: {} });

      assert.deepEqual(result.capabilities.textDocumentSync, { openClose: true, change: 1 });
      assert.equal(result.capabilities.hoverProvider, true);
    });

    it('sends `initialized` itself, once, and ignores it from editors', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.notify('initialized', {});
      b.notify('initialized', {});
      await Promise.all([a.flush(), b.flush()]);

      assert.equal(serverNotifications('initialized').length, 1);
    });

    it('answers requests with null until an editor initializes the server', async () => {
      const a = await connectEditor({ initialize: false });
      const hover = await a.request('textDocument/hover', {
        textDocument: { uri: MAIN_TS },
        position: { line: 0, character: 0 },
      });

      assert.equal(hover, null);
    });

    it('holds requests made while the server is initializing', async () => {
      const a = await connectEditor({ initialize: false });
      const b = await connectEditor({ initialize: false });
      const initializing = a.request('initialize', { capabilities: {} });
      const hover = b.request('textDocument/hover', {
        textDocument: { uri: MAIN_TS },
        position: { line: 3, character: 4 },
      });
      await initializing;

      assert.deepEqual(await hover, { contents: 'hover at 3:4' });
    });

    it('opens documents from before initialization once the server is ready', async () => {
      const a = await connectEditor({ initialize: false });
      a.open('first');
      a.change('second', 2);
      await a.flush();
      assert.deepEqual(received, []);

      await a.request('initialize', { capabilities: {} });
      await a.flush();

      assert.deepEqual(
        received.map(({ method }) => method),
        ['initialized', 'textDocument/didOpen']
      );
      assert.deepEqual(serverNotifications('textDocument/didOpen'), [
        { textDocument: { uri: MAIN_TS, languageId: 'typescript', version: 2, text: 'second' } },
      ]);
    });

    it('ignores shutdown and exit so one editor cannot stop the room server', async () => {
      const a = await connectEditor();
      const result = await a.request('shutdown');
      a.notify('exit');
      await a.flush();

      assert.equal(result, null);
      assert.deepEqual(serverNotifications('exit'), []);
    });
  });

  describe('document sync', () => {
    it('opens a document once when several editors open it', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.open('const a = 1;');
      await a.flush();
      b.open('const a = 1;');
      await b.flush();

      assert.equal(serverNotifications('textDocument/didOpen').length, 1);
      assert.deepEqual(serverNotifications('textDocument/didChange'), []);
    });

    it('syncs the text when a later editor opens a document with different content', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.open('const a = 1;');
      await a.flush();
      b.open('const a = 12;');
      await b.flush();

      assert.deepEqual(serverNotifications('textDocument/didChange'), [
        { textDocument: { uri: MAIN_TS, version: 2 }, contentChanges: [{ text: 'const a = 12;' }] },
      ]);
    });

    it('drops repeated text and numbers changes itself', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.open('a');
      await a.flush();
      // Both editors report the same edit, each with its own version number.
      a.change('ab', 2);
      await a.flush();
      b.change('ab', 7);
      await b.flush();
      a.change('abc', 3);
      await a.flush();

      assert.deepEqual(
        serverNotifications('textDocument/didChange').map((params) => [
          params.textDocument.version,
          params.contentChanges[0].text,
        ]),
        [
          [2, 'ab'],
          [3, 'abc'],
        ]
      );
    });

    it('ignores ranged changes, which cannot be applied to shared text', async () => {
      const a = await connectEditor();
      a.open('abc');
      a.notify('textDocument/didChange', {
        textDocument: { uri: MAIN_TS, version: 2 },
        contentChanges: [
          {
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
            text: 'z',
          },
        ],
      });
      await a.flush();

      assert.deepEqual(serverNotifications('textDocument/didChange'), []);
    });

    it('ignores changes to documents that were never opened', async () => {
      const a = await connectEditor();
      a.change('orphan');
      await a.flush();

      assert.deepEqual(serverNotifications('textDocument/didChange'), []);
    });
  });

  describe('closing documents', () => {
    it('keeps a document open until the last editor closes it', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.open('x');
      b.open('x');
      await Promise.all([a.flush(), b.flush()]);

      a.close();
      await a.flush();
      assert.deepEqual(serverNotifications('textDocument/didClose'), []);

      b.close();
      await b.flush();
      assert.deepEqual(serverNotifications('textDocument/didClose'), [
        { textDocument: { uri: MAIN_TS } },
      ]);
    });

    it('counts an editor that opens the same document twice only once', async () => {
      const a = await connectEditor();
      a.open('x');
      a.open('x');
      a.close();
      await a.flush();

      assert.equal(serverNotifications('textDocument/didClose').length, 1);
    });

    it('releases documents when an editor disconnects without closing them', async () => {
      const a = await connectEditor();
      const b = await connectEditor();
      a.open('x');
      b.open('x');
      await Promise.all([a.flush(), b.flush()]);

      a.disconnect();
      b.disconnect();
      await sleep(5);

      assert.equal(serverNotifications('textDocument/didClose').length, 1);
    });

    it('tells the server when a closed document has been deleted from disk', async () => {
      const a = await connectEditor();
      a.open('function greet() {}');
      await a.flush();
      existingFiles.delete(MAIN_TS);
      a.close();
      await a.flush();

      assert.deepEqual(serverNotifications('workspace/didChangeWatchedFiles'), [
        { changes: [{ uri: MAIN_TS, type: 3 }] },
      ]);
    });

    it('catches a file that is deleted shortly after its document closes', async () => {
      const a = await connectEditor();
      a.open('function greet() {}');
      a.close();
      await a.flush();
      assert.deepEqual(serverNotifications('workspace/didChangeWatchedFiles'), []);

      existingFiles.delete(MAIN_TS);
      await sleep(DELETION_CHECK_MS * 3);
      await a.flush();

      assert.equal(serverNotifications('workspace/didChangeWatchedFiles').length, 1);
    });

    it('does not report a deletion if the document is reopened in the meantime', async () => {
      const a = await connectEditor();
      a.open('x');
      a.close();
      a.open('x');
      await a.flush();
      existingFiles.delete(MAIN_TS);
      await sleep(DELETION_CHECK_MS * 3);
      await a.flush();

      assert.deepEqual(serverNotifications('workspace/didChangeWatchedFiles'), []);
    });

    it('reopens a closed document with fresh state', async () => {
      const a = await connectEditor();
      a.open('a', MAIN_JS);
      a.close(MAIN_JS);
      a.open('b', MAIN_JS);
      await a.flush();

      assert.deepEqual(
        serverNotifications('textDocument/didOpen').map((params) => params.textDocument.text),
        ['a', 'b']
      );
    });
  });

  describe('other traffic', () => {
    it('routes each editor’s requests and responses separately', async () => {
      const a = await connectEditor();
      const b = await connectEditor();

      const [hoverA, hoverB] = await Promise.all([
        a.request('textDocument/hover', {
          textDocument: { uri: MAIN_TS },
          position: { line: 1, character: 1 },
        }),
        b.request('textDocument/hover', {
          textDocument: { uri: MAIN_TS },
          position: { line: 2, character: 2 },
        }),
      ]);

      assert.deepEqual(hoverA, { contents: 'hover at 1:1' });
      assert.deepEqual(hoverB, { contents: 'hover at 2:2' });
    });

    it('answers configuration requests from the server itself', async () => {
      const config = await languageServer.sendRequest('workspace/configuration', {
        items: [{ section: 'typescript' }, { section: 'javascript' }],
      });

      assert.deepEqual(config, [null, null]);
    });

    it('does not send server notifications to editors', async () => {
      const a = await connectEditor();
      await languageServer.sendNotification('textDocument/publishDiagnostics', {
        uri: MAIN_TS,
        diagnostics: [],
      });
      await languageServer.sendNotification('window/logMessage', { type: 3, message: 'hi' });
      await a.flush();

      assert.deepEqual(a.notifications, []);
    });
  });
});
