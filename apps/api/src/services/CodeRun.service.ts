import { getSandbox } from '@/containers/CustomSandbox.do';
import { AppContext } from '..';
import { Id } from '@coderscreen/common/id';
import { Context } from 'hono';

export class CodeRunService {
	private ctx: Context<AppContext>;

	constructor(ctx: Context<AppContext>) {
		this.ctx = ctx;
	}

	async runCode(params: { roomId: Id<'room'>; code: string; language?: string }) {
		const { roomId, code, language = 'javascript' } = params;

		// Get the durable object to broadcast execution status
		const id = this.ctx.env.ROOM_DO.idFromName(roomId);
		const roomDo = this.ctx.env.ROOM_DO.get(id);

		const sandbox = await getSandbox(this.ctx.env.SANDBOX, roomId);

		try {
			// Broadcast execution start
			await roomDo.handleCodeExecution({ type: 'start' });

			// Determine file extension and command based on language
			const fileExtension = this.getFileExtension(language);
			const fileName = `code.${fileExtension}`;
			const command = this.getExecutionCommand(language);

			console.log('command', command);
			console.log('fileName', fileName);
			console.log('code', code);

			// Write the code to a file in the sandbox
			await sandbox.writeFile(fileName, code, { encoding: 'utf8' });

			// Execute the code in the sandbox
			const result = await sandbox.exec(command, [fileName]);
			console.log('sandbox-result', result);

			// Clean up the file
			await sandbox.deleteFile(fileName, {});

			// Extract output from the result - handle both void and result object cases
			let output = 'Execution completed';
			let exitCode = 0;
			let error = null;

			if (result && typeof result === 'object' && 'stdout' in result) {
				output = result.stdout || result.stderr || 'Execution completed';
				exitCode = result.exitCode || 0;
				error = result.stderr || null;
			}

			// Broadcast execution complete
			await roomDo.handleCodeExecution({ type: 'complete', output });

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
