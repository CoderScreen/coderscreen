import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class RubyRunner extends CodeRunner {
	private sourceFilePath = 'tmp.rb';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp Ruby source file
		await this.sandbox.writeFile(this.sourceFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		// Run the Ruby code using the ruby interpreter
		const result = await this.sandbox.exec('ruby', [this.sourceFilePath]);

		return result;
	}

	async cleanup() {
		// Clean up the source file
		await this.sandbox.deleteFile(this.sourceFilePath);
	}
}
