import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

export interface LanguageServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  /** Sent to the server as `initializationOptions`, in place of the editor's. */
  initializationOptions?: unknown;
  /**
   * Answers to the server's `workspace/configuration` requests, looked up by
   * section (`python.analysis` reads `settings.python.analysis`). Sections
   * that aren't here get null, which servers treat as "use the defaults".
   */
  settings?: Record<string, unknown>;
  /**
   * The server sends rust-analyzer's `experimental/serverStatus`, and editors
   * should show it as loading until it reports itself quiescent rather than
   * as soon as it has started.
   */
  readyWhenQuiescent?: boolean;
}

/** Path to a file inside one of lsp-server's npm dependencies. */
const npmFile = (packageName: string, file: string) =>
  path.join(path.dirname(require.resolve(`${packageName}/package.json`)), file);

/**
 * TypeScript 7's compiler is a native binary with a built-in language server
 * (`tsc --lsp`). We run the platform binary directly rather than through the
 * npm wrapper, which would add a Node process in front of it.
 */
const typescript = (): LanguageServerConfig => ({
  command: npmFile(`@typescript/typescript-${process.platform}-${process.arch}`, 'lib/tsc'),
  args: ['--lsp', '--stdio'],
});

const python = (): LanguageServerConfig => ({
  command: process.execPath,
  args: [npmFile('pyright', 'langserver.index.js'), '--stdio'],
  settings: {
    python: { analysis: { typeCheckingMode: 'off', diagnosticMode: 'openFilesOnly' } },
  },
});

/**
 * rust-analyzer normally needs a Cargo project. Linking `main.rs` directly
 * makes it a standalone crate with the standard library, the same way
 * `rustc main.rs` builds it. No `cargo check` on save: it would compete with
 * the candidate's own runs for CPU, and we don't show diagnostics anyway.
 */
const RUST_ANALYZER_SETTINGS = {
  linkedProjects: ['/workspace/main.rs'],
  checkOnSave: false,
  cargo: { buildScripts: { enable: false } },
  procMacro: { enable: false },
  // Index the standard library as soon as the project loads, so the first
  // completion is fast (under 1s instead of 6-10s) once the editor shows
  // the server as ready. It costs about 75 MB more.
  cachePriming: { enable: true },
  lru: { capacity: 32 },
  numThreads: 2,
};
const rust = (): LanguageServerConfig => ({
  command: '/root/.cargo/bin/rust-analyzer',
  args: [],
  initializationOptions: RUST_ANALYZER_SETTINGS,
  settings: { 'rust-analyzer': RUST_ANALYZER_SETTINGS },
  // Loading and indexing the standard library takes about 12s on the
  // sandbox's CPU, and suggestions are empty until it's done.
  readyWhenQuiescent: true,
});

// Without a go.mod, gopls treats main.go as a standalone package, which is
// how `go run main.go` builds it.
const go = (): LanguageServerConfig => ({ command: '/root/go/bin/gopls', args: [] });

/**
 * clangd compiles the file with these flags since there's no
 * compile_commands.json. They match the room's gcc/g++ commands.
 */
const clangd = (standard: string): LanguageServerConfig => ({
  command: '/opt/clangd/bin/clangd',
  args: [
    '--background-index=false',
    '--header-insertion=never',
    '--header-insertion-decorators=false',
    '--log=error',
  ],
  initializationOptions: { fallbackFlags: [`-std=${standard}`] },
});

/**
 * Eclipse JDT. It runs on its own Java 21 runtime (the room's Java is 11),
 * and opens `Solution.java` as a standalone file. The heap is capped so it
 * leaves room for the candidate's code.
 */
const JDTLS_SETTINGS = { java: { signatureHelp: { enabled: true } } };
const java = (): LanguageServerConfig => ({
  command: '/opt/jdtls/bin/jdtls',
  args: [
    '--jvm-arg=-Xms64m',
    '--jvm-arg=-Xmx512m',
    '--jvm-arg=-XX:+UseSerialGC',
    '--jvm-arg=-XX:TieredStopAtLevel=1',
    '-data',
    '/tmp/jdtls-workspace',
  ],
  env: { JAVA_HOME: '/opt/jdtls/jre' },
  initializationOptions: { settings: JDTLS_SETTINGS },
  settings: JDTLS_SETTINGS,
});

// Configured by phpactor.json, which the image installs as the user config.
const php = (): LanguageServerConfig => ({
  command: '/usr/local/bin/phpactor',
  args: ['language-server'],
});

const ruby = (): LanguageServerConfig => ({
  command: '/usr/local/bin/solargraph',
  args: ['stdio'],
});

const bash = (): LanguageServerConfig => ({
  command: process.execPath,
  args: [npmFile('bash-language-server', 'out/cli.js'), 'start'],
});

/**
 * Language servers the sandbox can run, keyed by the id editors connect with.
 * One server can cover several editor languages (TypeScript also serves
 * JavaScript). Keep in sync with `LspLanguageSchema` in the API.
 */
export const LANGUAGE_SERVERS = {
  typescript,
  python,
  rust,
  go,
  c: () => clangd('c99'),
  cpp: () => clangd('c++17'),
  java,
  php,
  ruby,
  bash,
} satisfies Record<string, () => LanguageServerConfig>;

export type LanguageServerId = keyof typeof LANGUAGE_SERVERS;

export const isLanguageServerId = (value: string): value is LanguageServerId =>
  Object.hasOwn(LANGUAGE_SERVERS, value);
