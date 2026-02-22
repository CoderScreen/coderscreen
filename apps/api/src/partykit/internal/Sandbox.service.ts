import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { AppContext } from '@/index';
import { getSandboxId } from '@/lib/sandbox';

export class SandboxService {
  constructor(private readonly env: AppContext['Bindings']) {}

  async startSandbox(params: { roomId: Id<'room'> }) {
    const sandboxId = getSandboxId(params.roomId);
    const sandbox = getSandbox(this.env.SANDBOX, sandboxId, { normalizeId: true });
    // Warm up the sandbox by running a simple command
    await sandbox.exec('echo ready');
  }
}
