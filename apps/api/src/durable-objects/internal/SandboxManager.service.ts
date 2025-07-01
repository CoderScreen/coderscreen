import { AppContext } from '@/index';
import { getSandbox, CustomSandbox as Sandbox } from '@/containers/CustomSandbox';

export class SandboxManagerService {
	constructor(private readonly env: AppContext['Bindings']) {}

	private getContainerId(): string {
		return `sandbox-test`;
	}

	async startSandbox(roomId: string): Promise<DurableObjectStub<Sandbox>> {
		let start = Date.now();
		const sandbox = getSandbox(this.env.SANDBOX, this.getContainerId());
		let end = Date.now();

		start = Date.now();
		await sandbox.startAndWaitForPorts([3000]);
		end = Date.now();
		console.log('sandbox', sandbox.id.toString(), 'startAndWaitForPorts', end - start);

		return sandbox;
	}

	async getSandbox(roomId: string): Promise<DurableObjectStub<Sandbox>> {
		return getSandbox(this.env.SANDBOX, this.getContainerId());
	}

	async runCode(roomId: string, language: string, code: string) {
		const sandbox = await this.getSandbox(roomId);
		let start = Date.now();
		const result = await sandbox.exec(this.getExecutionCommand(language, code), []);
		let end = Date.now();
		console.log('sandbox', sandbox.id.toString(), 'exec', end - start);
		return result;
	}

	async stopSandbox(roomId: string): Promise<void> {
		const sandbox = getSandbox(this.env.SANDBOX, this.getContainerId());
		await sandbox.stop();
	}

	private getExecutionCommand(language: string, code: string): string {
		const commands: Record<string, string> = {
			javascript: 'node -e',
			typescript: 'ts-node',
			python: 'python3',
			java: 'java',
			cpp: 'g++',
			c: 'gcc',
			rust: 'rustc',
			go: 'go',
			php: 'php',
			ruby: 'ruby',
			swift: 'swift',
			kotlin: 'kotlin',
			scala: 'scala',
		};

		return `${commands[language.toLowerCase()]} "${code}"`;
	}
}
