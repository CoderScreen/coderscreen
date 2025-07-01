// import { getSandbox } from '@/containers/CustomSandbox.do';
import { getSandbox } from '@/containers/CustomSandbox';
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

		// Get the durable object to broadcast execution status
		const id = this.ctx.env.ROOM_DO.idFromName(roomId);
		const roomDo = this.ctx.env.ROOM_DO.get(id);

		this.ctx.executionCtx.waitUntil(roomDo.handleCodeExecutioMessage({ type: 'start' }));

		const sandbox = getSandbox(this.ctx.env.SANDBOX, roomId);
		console.log('sandbox.id', sandbox.id.toString());
		const result = await sandbox.exec(this.getExecutionCommand(language), [code]);

		// Broadcast execution complete
		await roomDo.handleCodeExecutioMessage({ type: 'complete', output: result?.stdout || result?.stderr || 'No output from execution' });

		return result;
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
