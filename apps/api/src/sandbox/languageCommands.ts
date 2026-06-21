import type { RoomEntity } from '@coderscreen/db/room.db';

interface LanguageConfig {
  extension: string;
  runCommand: (filePath: string) => string;
  compileCommand?: (filePath: string, outputPath: string) => string;
  // Function-mode questions (signature + typed test cases + harness) require a
  // per-language harness file under `./harnesses/`. Languages without a
  // harness can still be wired here for stdio use, but the assessment runner
  // will refuse to execute function-mode submissions in those languages.
  supportsFunctionMode: boolean;
}

export const LANGUAGE_CONFIG: Record<RoomEntity['language'], LanguageConfig | undefined> = {
  javascript: {
    extension: '.js',
    runCommand: (f) => `node ${f}`,
    supportsFunctionMode: true,
  },
  typescript: {
    extension: '.ts',
    runCommand: (f) => `tsx ${f}`,
    supportsFunctionMode: true,
  },
  python: {
    extension: '.py',
    runCommand: (f) => `python3 ${f}`,
    supportsFunctionMode: true,
  },
  bash: {
    extension: '.sh',
    runCommand: (f) => `bash ${f}`,
    supportsFunctionMode: false,
  },
  go: {
    extension: '.go',
    runCommand: (f) => `go run ${f}`,
    supportsFunctionMode: false,
  },
  rust: {
    extension: '.rs',
    compileCommand: (f, o) => `rustc ${f} -o ${o}`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  c: {
    extension: '.c',
    compileCommand: (f, o) => `gcc -o ${o} ${f} -Wall -Wextra -std=c99`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  'c++': {
    extension: '.cpp',
    compileCommand: (f, o) => `g++ -o ${o} ${f} -Wall -Wextra -std=c++17`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  java: {
    extension: '.java',
    compileCommand: (f) => `javac ${f}`,
    runCommand: (f) => `java -cp /workspace ${f.replace('/workspace/', '').replace('.java', '')}`,
    supportsFunctionMode: false,
  },
  php: {
    extension: '.php',
    runCommand: (f) => `php ${f}`,
    supportsFunctionMode: true,
  },
  ruby: {
    extension: '.rb',
    runCommand: (f) => `ruby ${f}`,
    supportsFunctionMode: true,
  },
  // Framework languages — not single-file executable, handled by preview.
  react: undefined,
  vue: undefined,
  svelte: undefined,
};
