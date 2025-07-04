import { CustomSandbox } from '@/containers/CustomSandbox';
import { ExecuteResponse } from '@/lib/sandbox';

export class CodeRunner {
	static emptyResponse: ExecuteResponse = {
		id: 'empty',
		success: false,
		timestamp: new Date().toISOString(),
		stdout: '',
		stderr: 'No output from execution',
		exitCode: 0,
		elapsedTime: 0,
		command: '',
		args: [],
	};

	static timeoutResponse: ExecuteResponse = {
		id: 'timed-out',
		success: false,
		timestamp: new Date().toISOString(),
		stdout: '',
		stderr: 'Execution timed out. This may be due to an infinite loop or long-running code.',
		exitCode: -1,
		elapsedTime: 0,
		command: '',
		args: [],
	};

	constructor(protected sandbox: CustomSandbox, protected code: string) {}

	async setup() {
		return;
	}

	/**
	 * Abstract method that runners must implement
	 * This should contain the actual execution logic
	 */
	protected async executeInternal(): Promise<ExecuteResponse> {
		return CodeRunner.emptyResponse;
	}

	/**
	 * Public execute method that automatically applies timeout protection
	 */
	async execute(): Promise<ExecuteResponse> {
		return this.executeInternal();
		// const start = Date.now();

		// try {
		// 	// Create a timeout promise
		// 	const timeoutPromise = new Promise<ExecuteResponse>((_, reject) => {
		// 		setTimeout(() => {
		// 			reject(new Error(`Execution timed out after ${this.DEFAULT_TIMEOUT_MS}ms`));
		// 		}, this.DEFAULT_TIMEOUT_MS);
		// 	});

		// 	// Create the actual execution promise
		// 	const executionPromise = this.executeInternal();

		// 	// Race between execution and timeout
		// 	const result = await Promise.race([executionPromise, timeoutPromise]);
		// 	const duration = Date.now() - start;

		// 	// Check if the result indicates a timeout (from sandbox level)
		// 	if (result && this.isTimeoutResponse(result)) {
		// 		console.warn(`Execution timed out after ${duration}ms`);
		// 		return {
		// 			...this.timeoutResponse,
		// 			stderr: `Execution timed out after ${duration}ms. This may be due to an infinite loop or long-running code.`,
		// 			command: result.command,
		// 			args: result.args,
		// 		};
		// 	}

		// 	return result;
		// } catch (error) {
		// 	const duration = Date.now() - start;

		// 	// Handle timeout errors
		// 	if (error instanceof Error && error.message.includes('timed out')) {
		// 		console.warn(`Execution timed out after ${duration}ms`);
		// 		return {
		// 			...this.timeoutResponse,
		// 			stderr: `Execution timed out after ${duration}ms. This may be due to an infinite loop or long-running code.`,
		// 			command: '',
		// 			args: [],
		// 		};
		// 	}

		// 	// Handle other errors
		// 	return {
		// 		...this.emptyResponse,
		// 		stderr: error instanceof Error ? error.message : 'Unknown execution error',
		// 		exitCode: -2, // Special exit code for other errors
		// 	};
		// }
	}

	async cleanup() {
		return;
	}

	/**
	 * Helper method to check if a response indicates a timeout
	 */
	protected isTimeoutResponse(response: ExecuteResponse): boolean {
		return response.id === 'timed-out';
	}

	/**
	 * Helper method to create a timeout response with specific command info
	 */
	protected createTimeoutResponse(command: string, args: string[], duration: number): ExecuteResponse {
		return {
			...CodeRunner.timeoutResponse,
			stderr: `Execution timed out after ${duration}ms. This may be due to an infinite loop or long-running code.`,
			command,
			args,
		};
	}
}
