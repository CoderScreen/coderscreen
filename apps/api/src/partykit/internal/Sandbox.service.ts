import { Id } from '@coderscreen/common/id';
import { AppContext } from '@/index';
import { getSandboxId } from '@/lib/sandbox';

export class SandboxService {
  constructor(private readonly env: AppContext['Bindings']) {}

  async startSandbox(params: { roomId: Id<'room'> }) {
    const sandbox = this.getSandbox(params.roomId);
    sandbox.start();
  }

  private getSandbox(roomId: Id<'room'>) {
    const sandboxId = this.getId(roomId);
    return this.env.SANDBOX.get(sandboxId.durableObjectId);
  }

  private getId(roomId: Id<'room'>) {
    const rawSandboxId = getSandboxId(roomId);
    const sandboxId = this.env.SANDBOX.idFromName(rawSandboxId);

    return {
      id: rawSandboxId,
      durableObjectId: sandboxId,
    };
  }

  // private getNamespace(language: RoomEntity['language']) {
  // 	switch (language) {
  // 		case 'typescript':
  // 			return this.env.SANDBOX_NODE;
  // 		case 'javascript':
  // 			return this.env.SANDBOX_NODE;
  // 		case 'python':
  // 			return this.env.SANDBOX_PYTHON;
  // 		case 'rust':
  // 			return this.env.SANDBOX_RUST;
  // 		case 'c++':
  // 			return this.env.SANDBOX_CPP;
  // 		case 'c':
  // 			return this.env.SANDBOX_C;
  // 		case 'java':
  // 			return this.env.SANDBOX_JAVA;
  // 		case 'go':
  // 			return this.env.SANDBOX_GO;
  // 		case 'php':
  // 			return this.env.SANDBOX_PHP;
  // 		case 'ruby':
  // 			return this.env.SANDBOX_RUBY;
  // 		case 'bash':
  // 			// can use any sandbox and just run bash commands
  // 			return this.env.SANDBOX_NODE;
  // 		default:
  // 			throw new Error(`Unsupported language: ${language}`);
  // 	}
  // }
}
