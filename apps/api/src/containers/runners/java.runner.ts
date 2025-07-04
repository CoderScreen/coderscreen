import { CustomSandbox } from '@/containers/CustomSandbox';
import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class JavaRunner extends CodeRunner {
	private sourceFilePath = 'Solution.java';
	private classFilePath = 'Solution.class';

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
		const compileResult = await this.sandbox.exec('javac', [this.sourceFilePath]);

		// If compilation failed, return the compilation error
		if (!compileResult.success) {
			return compileResult;
		}

		// If compilation succeeded, run the Java class
		const runResult = await this.sandbox.exec('java', ['Solution']);

		return runResult;
	}

	async cleanup() {
		// Clean up both source file and compiled class file
		await this.sandbox.deleteFile(this.sourceFilePath);
		await this.sandbox.deleteFile(this.classFilePath);
	}
}
