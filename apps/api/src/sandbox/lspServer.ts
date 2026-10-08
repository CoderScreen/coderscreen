import type { getSandbox } from '@cloudflare/sandbox';
import { z } from 'zod';

type SandboxStub = ReturnType<typeof getSandbox>;

/** Language servers the sandbox can run (see containers/images/lsp-server/src/languages.ts). */
export const LspLanguageSchema = z.enum([
  'typescript',
  'python',
  'rust',
  'go',
  'c',
  'cpp',
  'java',
  'php',
  'ruby',
  'bash',
]);

/** Port the sandbox's language server WebSocket server listens on. */
export const LSP_PORT = 5005;

/** Process id of the language server, so other code can leave it running. */
export const LSP_PROCESS_ID = 'lsp-server';

const LSP_COMMAND = 'node /opt/lsp-server/dist/server.js';
const LSP_START_TIMEOUT_MS = 15_000;

/**
 * Process objects carry methods, so they come back from the sandbox Durable
 * Object as RPC stubs. Those have to be disposed explicitly, or workerd warns
 * that a stub leaked. (`Symbol.dispose` exists at runtime but isn't in our
 * TypeScript lib target.)
 */
const disposeStub = (stub: object) => {
  const dispose = (Symbol as { dispose?: symbol }).dispose;
  const disposeFn = dispose ? (stub as Record<symbol, unknown>)[dispose] : undefined;
  if (typeof disposeFn === 'function') disposeFn.call(stub);
};

// Listed rather than fetched with getProcess, which throws (and gets logged as
// an uncaught error inside the sandbox) when the process doesn't exist yet.
const findRunning = async (sandbox: SandboxStub) => {
  const processes = await sandbox.listProcesses();
  const running = processes.find(
    (process) =>
      process.id === LSP_PROCESS_ID &&
      (process.status === 'running' || process.status === 'starting')
  );
  for (const process of processes) {
    if (process !== running) disposeStub(process);
  }
  return running ?? null;
};

/**
 * Starts the sandbox's language server if it isn't already running, and
 * waits until it accepts connections. Safe to call concurrently: when two
 * editors race to start it, the loser picks up the winner's process.
 */
export async function ensureLspServer(sandbox: SandboxStub) {
  let process = await findRunning(sandbox);
  if (!process) {
    try {
      process = await sandbox.startProcess(LSP_COMMAND, { processId: LSP_PROCESS_ID });
    } catch (error) {
      process = await findRunning(sandbox);
      if (!process) throw error;
    }
  }

  try {
    await process.waitForPort(LSP_PORT, {
      path: '/health',
      status: 200,
      timeout: LSP_START_TIMEOUT_MS,
    });
  } finally {
    disposeStub(process);
  }
}
