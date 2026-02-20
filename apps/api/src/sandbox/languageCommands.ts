import type { RoomEntity } from '@coderscreen/db/room.db';

interface LanguageConfig {
	extension: string;
	runCommand: (filePath: string) => string;
	compileCommand?: (filePath: string, outputPath: string) => string;
}

export const LANGUAGE_CONFIG: Record<RoomEntity['language'], LanguageConfig | undefined> = {
	javascript: {
		extension: '.js',
		runCommand: (f) => `node ${f}`,
	},
	typescript: {
		extension: '.ts',
		runCommand: (f) => `tsx ${f}`,
	},
	python: {
		extension: '.py',
		runCommand: (f) => `python3 ${f}`,
	},
	bash: {
		extension: '.sh',
		runCommand: (f) => `bash ${f}`,
	},
	go: {
		extension: '.go',
		runCommand: (f) => `go run ${f}`,
	},
	rust: {
		extension: '.rs',
		compileCommand: (f, o) => `rustc ${f} -o ${o}`,
		runCommand: (o) => `./${o}`,
	},
	c: {
		extension: '.c',
		compileCommand: (f, o) => `gcc -o ${o} ${f} -Wall -Wextra -std=c99`,
		runCommand: (o) => `./${o}`,
	},
	'c++': {
		extension: '.cpp',
		compileCommand: (f, o) => `g++ -o ${o} ${f} -Wall -Wextra -std=c++17`,
		runCommand: (o) => `./${o}`,
	},
	java: {
		extension: '.java',
		compileCommand: (f) => `javac ${f}`,
		runCommand: (f) => `java -cp /workspace ${f.replace('/workspace/', '').replace('.java', '')}`,
	},
	php: {
		extension: '.php',
		runCommand: (f) => `php ${f}`,
	},
	ruby: {
		extension: '.rb',
		runCommand: (f) => `ruby ${f}`,
	},
	// Framework languages - not single-file executable, handled by preview in Phase 5
	react: undefined,
	vue: undefined,
	svelte: undefined,
};
