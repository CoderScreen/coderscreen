import type { RoomEntity } from '@coderscreen/db/room.db';

interface LanguageConfig {
  extension: string;
  // Basename of the entry file inside `/workspace`. MUST match the filename
  // produced by the single-file template for this language (see
  // `lib/templates/singleFileTemplates.ts`), otherwise the room runner points
  // at a file that was never synced and execution fails. Most languages use
  // `main<extension>`, but a few are special (bash -> script.sh, java ->
  // Solution.java because the public class must be named Solution).
  fileName: string;
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
    fileName: 'main.js',
    runCommand: (f) => `node ${f}`,
    supportsFunctionMode: true,
  },
  typescript: {
    extension: '.ts',
    fileName: 'main.ts',
    runCommand: (f) => `tsx ${f}`,
    supportsFunctionMode: true,
  },
  python: {
    extension: '.py',
    fileName: 'main.py',
    runCommand: (f) => `python3 ${f}`,
    supportsFunctionMode: true,
  },
  bash: {
    extension: '.sh',
    fileName: 'script.sh',
    runCommand: (f) => `bash ${f}`,
    supportsFunctionMode: false,
  },
  go: {
    extension: '.go',
    fileName: 'main.go',
    runCommand: (f) => `go run ${f}`,
    supportsFunctionMode: false,
  },
  rust: {
    extension: '.rs',
    fileName: 'main.rs',
    compileCommand: (f, o) => `rustc ${f} -o ${o}`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  c: {
    extension: '.c',
    fileName: 'main.c',
    compileCommand: (f, o) => `gcc -o ${o} ${f} -Wall -Wextra -std=c99`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  'c++': {
    extension: '.cpp',
    fileName: 'main.cpp',
    compileCommand: (f, o) => `g++ -o ${o} ${f} -Wall -Wextra -std=c++17`,
    runCommand: (o) => o,
    supportsFunctionMode: false,
  },
  java: {
    extension: '.java',
    fileName: 'Solution.java',
    compileCommand: (f) => `javac ${f}`,
    runCommand: (f) => `java -cp /workspace ${f.replace('/workspace/', '').replace('.java', '')}`,
    supportsFunctionMode: false,
  },
  php: {
    extension: '.php',
    fileName: 'main.php',
    runCommand: (f) => `php ${f}`,
    supportsFunctionMode: true,
  },
  ruby: {
    extension: '.rb',
    fileName: 'main.rb',
    runCommand: (f) => `ruby ${f}`,
    supportsFunctionMode: true,
  },
  // Framework languages — not single-file executable, handled by preview.
  react: undefined,
  vue: undefined,
  svelte: undefined,
};
