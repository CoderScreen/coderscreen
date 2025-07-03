import { Sandbox } from '@cloudflare/sandbox';
import { getContainer } from '@cloudflare/containers';
import { AppContext } from '@/index';
import { RoomEntity } from '@coderscreen/db/room.db';

export class CustomSandbox extends Sandbox<AppContext['Bindings']> {
	defaultPort = 3000; // Port the container is listening on
	sleepAfter = '10m'; // Stop the instance if requests not sent for 1h

	async runCode(params: { language: RoomEntity['language']; code: string }) {
		const { language, code } = params;

		const result = await (async () => {
			switch (language) {
				case 'javascript':
					return this.runJs(code);
				case 'typescript':
					return this.runTs(code);
				case 'python':
					return this.runPython(code);
				case 'java':
					return this.runJava(code);
				default:
					throw new Error(`Unsupported language: ${language}`);
			}
		})();

		return result;
	}

	private runJs(code: string) {
		return this.exec('node', ['-e', `"${code}"`]);
	}

	private runTs(code: string) {
		return this.exec('ts-node', [code]);
	}

	private runPython(code: string) {
		return this.exec('python3', [code]);
	}

	private runJava(code: string) {
		return this.exec('java', [code]);
	}
}
