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
		const result = await this.sandbox.exec('go', ['run', this.sourceFilePath]);

		return result;
	}

	async cleanup() {
		// Clean up the source file
		await this.sandbox.deleteFile(this.sourceFilePath);
	}
}
