import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class PhpRunner extends CodeRunner {
	private sourceFilePath = 'tmp.php';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp PHP source file
		await this.sandbox.writeFile(this.sourceFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		// Run the PHP code using the php interpreter
		const result = await this.sandbox.exec('php', [this.sourceFilePath]);

		return result;
	}

	async cleanup() {
		// Clean up the source file
		await this.sandbox.deleteFile(this.sourceFilePath);
	}
}
