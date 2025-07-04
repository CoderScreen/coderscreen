import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class TypescriptRunner extends CodeRunner {
	private tmpFilePath = 'tmp.ts';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp file
		await this.sandbox.writeFile(this.tmpFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		const result = await this.sandbox.exec('ts-node', [this.tmpFilePath]);

		return result;
	}

	async cleanup() {
		await this.sandbox.deleteFile(this.tmpFilePath);
	}
}
