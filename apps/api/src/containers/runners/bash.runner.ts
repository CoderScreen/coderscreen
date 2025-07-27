import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class BashRunner extends CodeRunner {
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
