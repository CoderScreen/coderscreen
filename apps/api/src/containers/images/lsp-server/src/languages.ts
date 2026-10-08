import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

export interface LanguageServerCommand {
  command: string;
  args: string[];
}

/**
 * TypeScript 7's compiler is a native binary with a built-in language server
 * (`tsc --lsp`). We run the platform binary directly rather than through the
 * npm wrapper, which would add a Node process in front of it.
 */
const typescriptServer = (): LanguageServerCommand => {
  const platformPackage = `@typescript/typescript-${process.platform}-${process.arch}`;
  const packageDir = path.dirname(require.resolve(`${platformPackage}/package.json`));
  return { command: path.join(packageDir, 'lib', 'tsc'), args: ['--lsp', '--stdio'] };
};

/**
 * Language servers the sandbox can run, keyed by the id editors connect with.
 * One server can cover several editor languages (TypeScript also serves
 * JavaScript).
 */
export const LANGUAGE_SERVERS = {
  typescript: typescriptServer,
} satisfies Record<string, () => LanguageServerCommand>;

export type LanguageServerId = keyof typeof LANGUAGE_SERVERS;

export const isLanguageServerId = (value: string): value is LanguageServerId =>
  Object.hasOwn(LANGUAGE_SERVERS, value);
