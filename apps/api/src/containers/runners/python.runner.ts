import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class PythonRunner extends CodeRunner {
	private tmpFilePath = 'tmp.py';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp file
		await this.sandbox.writeFile(this.tmpFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		let start = Date.now();
		const result = await this.sandbox.exec('python', [this.tmpFilePath]);
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
		await this.sandbox.deleteFile(this.tmpFilePath);
	}
}
