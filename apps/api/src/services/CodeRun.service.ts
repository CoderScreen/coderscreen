import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { RoomEntity } from '@coderscreen/db/room.db';
import { Context } from 'hono';
import { AppContext } from '..';
import { FormattedOutput, getSandboxId } from '@/lib/sandbox';
import { LANGUAGE_CONFIG } from '@/sandbox/languageCommands';

const EXECUTION_TIMEOUT_MS = 15000;

export class CodeRunService {
	private ctx: Context<AppContext>;

	constructor(ctx: Context<AppContext>) {
		this.ctx = ctx;
	}

	async runCode(params: {
		roomId: Id<'room'>;
		code: string;
		language: RoomEntity['language'];
	}): Promise<FormattedOutput> {
		const { roomId, code, language } = params;

		const config = LANGUAGE_CONFIG[language];
		if (!config) {
			return {
				success: false,
				timestamp: new Date().toISOString(),
				stdout: '',
				stderr: `Language "${language}" does not support single-file execution. Use the preview feature instead.`,
				exitCode: 1,
				elapsedTime: -1,
				compileTime: undefined,
			};
		}

		const sandboxId = getSandboxId(roomId);
		const sandbox = getSandbox(this.ctx.env.SANDBOX, sandboxId, { normalizeId: true });

		const filePath = `/workspace/main${config.extension}`;
		const outputPath = '/workspace/main_out';

		try {
			// Write code to sandbox filesystem
			await sandbox.writeFile(filePath, code);

			const start = Date.now();
			let compileTime: number | undefined;

			// Compile step for compiled languages
			if (config.compileCommand) {
				const compileResult = await sandbox.exec(config.compileCommand(filePath, outputPath), {
					timeout: EXECUTION_TIMEOUT_MS,
				});
				compileTime = Date.now() - start;

				if (!compileResult.success) {
					return {
						success: false,
						stdout: compileResult.stdout,
						stderr: compileResult.stderr,
						exitCode: compileResult.exitCode,
						elapsedTime: compileTime,
						compileTime,
						timestamp: new Date().toISOString(),
					};
				}
			}

			// Run the code
			const runTarget = config.compileCommand ? outputPath : filePath;
			const result = await sandbox.exec(config.runCommand(runTarget), {
				timeout: EXECUTION_TIMEOUT_MS,
			});

			return {
				success: result.success,
				stdout: result.stdout,
				stderr: result.stderr,
				exitCode: result.exitCode,
				elapsedTime: Date.now() - start,
				compileTime,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error('Error running code:', error);
			return {
				success: false,
				timestamp: new Date().toISOString(),
				stdout: '',
				stderr: error instanceof Error ? error.message : 'Error running code',
				exitCode: 1,
				elapsedTime: -1,
				compileTime: undefined,
			};
		}
	}
}
