import type { FileType } from '@/query/realtime/editor.query';

export interface LspTarget {
  /** Which of the sandbox's language servers to connect to (see lsp-server/src/languages.ts). */
  server: string;
  /** The LSP language id for the file. */
  languageId: string;
  /** Connect when the room opens instead of on first use (see LSP_ROOMS). */
  connectOnOpen: boolean;
}

/**
 * Room languages with autocomplete, and the files in them it covers. Framework
 * rooms (React, Vue, Svelte) also contain .ts files but need their packages
 * installed to be useful, so they aren't here yet.
 */
const LSP_ROOMS: Record<
  string,
  { server: string; files: Partial<Record<FileType, string>>; connectOnOpen?: boolean }
> = {
  typescript: {
    server: 'typescript',
    files: { typescript: 'typescript', javascript: 'javascript' },
  },
  javascript: {
    server: 'typescript',
    files: { typescript: 'typescript', javascript: 'javascript' },
  },
  python: { server: 'python', files: { python: 'python' } },
  // rust-analyzer needs about 30s on the sandbox's CPU to load the standard
  // library, and has nothing useful to suggest until then. Starting it when
  // the room opens means it's usually ready by the time someone types.
  rust: { server: 'rust', files: { rust: 'rust' }, connectOnOpen: true },
  go: { server: 'go', files: { go: 'go' } },
  c: { server: 'c', files: { c: 'c' } },
  'c++': { server: 'cpp', files: { 'c++': 'cpp' } },
  java: { server: 'java', files: { java: 'java' } },
  php: { server: 'php', files: { php: 'php' } },
  ruby: { server: 'ruby', files: { ruby: 'ruby' } },
  bash: { server: 'bash', files: { bash: 'shellscript' } },
};

/** The language server for a file in a room, or null if it doesn't get autocomplete. */
export const getLspTarget = (roomLanguage: string, fileType: FileType): LspTarget | null => {
  const room = Object.hasOwn(LSP_ROOMS, roomLanguage) ? LSP_ROOMS[roomLanguage] : undefined;
  const languageId = room?.files[fileType];
  return room && languageId
    ? { server: room.server, languageId, connectOnOpen: room.connectOnOpen ?? false }
    : null;
};
