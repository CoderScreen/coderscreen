import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class GoRunner extends CodeRunner {
	private sourceFilePath = 'tmp.go';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp Go source file
		await this.sandbox.writeFile(this.sourceFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		let start = Date.now();
		const result = await this.sandbox.exec('go', ['run', this.sourceFilePath]);
		let end = Date.now();
		const elapsedTime = end - start;

		return result
			? {
					id: crypto.randomUUID(),
					...result,
					elapsedTime,
				}
			: this.emptyResponse;
	}

	async cleanup() {
		// Clean up the source file
		await this.sandbox.deleteFile(this.sourceFilePath);
	}
}
