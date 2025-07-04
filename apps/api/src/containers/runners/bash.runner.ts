import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class BashRunner extends CodeRunner {
	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		const result = await this.sandbox.exec(this.code, []);

		return result;
	}

	async cleanup() {
		return;
	}
}
