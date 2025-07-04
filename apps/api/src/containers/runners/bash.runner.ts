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
		let start = Date.now();
		const result = await this.sandbox.exec('bash', [this.code]);
		let end = result ? new Date(result.timestamp).getTime() : 0;
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
		return;
	}
}
