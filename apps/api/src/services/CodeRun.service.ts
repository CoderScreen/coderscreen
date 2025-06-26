import { AppContext } from '..';
import { Id } from '@coderscreen/common/id';
import { Context } from 'hono';

export class CodeRunService {
	private ctx: Context<AppContext>;

	constructor(ctx: Context<AppContext>) {
		this.ctx = ctx;
	}

	async runCode(params: { roomId: Id<'room'>; code: string }) {
		const { roomId, code } = params;

		// Get the durable object to broadcast execution status
		const id = this.ctx.env.ROOM_DO.idFromName(roomId);
		const roomDo = this.ctx.env.ROOM_DO.get(id);

		try {
			// Broadcast execution start
			await roomDo.handleCodeExecution({ type: 'start' });

			// Simulate code execution delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Generate random output as placeholder
			const randomOutput = `Output: ${Math.random().toString(36).substring(2, 20)}\nResult: ${Date.now()}\nCode length: ${code.length} characters`;

			// Broadcast execution complete
			await roomDo.handleCodeExecution({ type: 'complete', output: randomOutput });

			return { result: randomOutput };
		} catch (error) {
			// Broadcast execution error
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			await roomDo.handleCodeExecution({ type: 'error', error: errorMessage });

			throw error;
		}
	}
}
