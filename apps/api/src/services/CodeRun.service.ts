// import { getSandbox } from '@/containers/CustomSandbox.do';
import { getSandbox } from '@cloudflare/sandbox';
import { AppContext } from '..';
import { Id } from '@coderscreen/common/id';
import { Context } from 'hono';

export class CodeRunService {
	private ctx: Context<AppContext>;

	constructor(ctx: Context<AppContext>) {
		this.ctx = ctx;
	}

	async runCode(params: { roomId: Id<'room'>; code: string; language: string }) {
		const { roomId, code, language } = params;

		const randomId = crypto.randomUUID();
		// Get the durable object to broadcast execution status
		const id = this.ctx.env.ROOM_DO.idFromName(roomId);
		const roomDo = this.ctx.env.ROOM_DO.get(id);

		let start = Date.now();
		const sandbox = getSandbox(this.ctx.env.SANDBOX, 'code-execution-sandbox');
		let end = Date.now();
		console.log('sandbox-time', end - start);

		start = Date.now();
		await sandbox.startAndWaitForPorts([3000]);
		end = Date.now();
		console.log('sandbox-start-time', end - start);

		try {
			// Broadcast execution start

			// await roomDo.handleCodeExecution({ type: 'start' });

			// Determine file extension and command based on language
			const fileExtension = this.getFileExtension(language);
			const fileName = `code.${fileExtension}`;
			const command = this.getExecutionCommand(language);

			console.log('command', command);
			console.log('fileName', fileName);
			console.log('code', code);

			// Write the code to a file in the sandbox
			// start = Date.now();
			// await sandbox.writeFile(fileName, code, { encoding: 'utf8' });
			// end = Date.now();
			// console.log('write-file-time', end - start);

			// Execute the code in the sandbox
			start = Date.now();
			const result = await sandbox.exec(`node -e "console.log('23131');"`, []);
			end = Date.now();
			console.log('exec-time', end - start);
			console.log('sandbox-result', result);

			// // Clean up the file
			// start = Date.now();
			// await sandbox.deleteFile(fileName, {});
			// end = Date.now();
			// console.log('delete-file-time', end - start);

			// Extract output from the result - handle both void and result object cases
			let output = 'No output from execution';
			let exitCode = 0;
			let error = null;

			if (result && typeof result === 'object' && 'stdout' in result) {
				output = result.stdout || result.stderr || 'No output from execution';
				exitCode = result.exitCode || 0;
				error = result.stderr || null;
			}

			// Broadcast execution complete
			// await roomDo.handleCodeExecution({ type: 'complete', output });

			return {
				result: output,
				exitCode,
				error,
			};
		} catch (error) {
			// Broadcast execution error
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			await roomDo.handleCodeExecution({ type: 'error', error: errorMessage });

			throw error;
		}
	}

	private getFileExtension(language: string): string {
		const extensions: Record<string, string> = {
			javascript: 'js',
			typescript: 'ts',
			python: 'py',
			java: 'java',
			cpp: 'cpp',
			c: 'c',
			rust: 'rs',
			go: 'go',
			php: 'php',
			ruby: 'rb',
			swift: 'swift',
			kotlin: 'kt',
			scala: 'scala',
		};
		return extensions[language.toLowerCase()] || 'js';
	}

	private getExecutionCommand(language: string): string {
		const commands: Record<string, string> = {
			javascript: 'node',
			typescript: 'ts-node',
			python: 'python3',
			java: 'java',
			cpp: 'g++',
			c: 'gcc',
			rust: 'rustc',
			go: 'go',
			php: 'php',
			ruby: 'ruby',
			swift: 'swift',
			kotlin: 'kotlin',
			scala: 'scala',
		};
		return commands[language.toLowerCase()] || 'node';
	}
}
