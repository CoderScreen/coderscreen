import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class RustRunner extends CodeRunner {
	private sourceFilePath = 'tmp.rs';
	private executablePath = 'tmp';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp Rust source file
		await this.sandbox.writeFile(this.sourceFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		let start = Date.now();
		// First compile the Rust code
		const compileResult = await this.sandbox.exec('rustc', ['-o', this.executablePath, this.sourceFilePath]);
		let end = Date.now();
		let elapsedTime = end - start;

		// If compilation failed, return the compilation error
		if (compileResult && !compileResult.success) {
			return {
				id: crypto.randomUUID(),
				...compileResult,
				elapsedTime,
			};
		}

		// If compilation succeeded, run the executable
		const runResult = await this.sandbox.exec(`./${this.executablePath}`, []);
		end = Date.now();
		elapsedTime = end - start;

		return runResult
			? {
					id: crypto.randomUUID(),
					...runResult,
					elapsedTime,
				}
			: this.emptyResponse;
	}

	async cleanup() {
		// Clean up both source file and executable
		await this.sandbox.deleteFile(this.sourceFilePath);
		await this.sandbox.deleteFile(this.executablePath);
	}
}
