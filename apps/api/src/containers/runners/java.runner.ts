import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class JavaRunner extends CodeRunner {
	private sourceFilePath = 'Main.java';
	private classFilePath = 'Main.class';

	constructor(sandbox: CustomSandbox, code: string) {
		super(sandbox, code);
	}

	async setup() {
		// Create a temp Java source file
		await this.sandbox.writeFile(this.sourceFilePath, this.code);
		return;
	}

	async executeInternal(): Promise<ExecuteResponse> {
		// First compile the Java code
		let start = Date.now();
		const compileResult = await this.sandbox.exec('javac', [this.sourceFilePath]);
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

		// If compilation succeeded, run the Java class
		const runResult = await this.sandbox.exec('java', ['Main']);
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
		// Clean up both source file and compiled class file
		await this.sandbox.deleteFile(this.sourceFilePath);
		await this.sandbox.deleteFile(this.classFilePath);
	}
}
