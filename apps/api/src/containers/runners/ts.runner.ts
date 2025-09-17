import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class TypescriptRunner extends CodeRunner {
  private tmpFilePath = 'tmp.ts';

  async setup() {
    // Create a temp file
    const start = Date.now();
    await this.sandbox.writeFile(this.tmpFilePath, this.code);
    console.log('setup.time', Date.now() - start);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    const start = Date.now();
    const result = await this.sandbox.exec('bun run', [this.tmpFilePath]);

    console.log('result', result);
    console.log('executeInternal.time', Date.now() - start);

    return result;
  }

  async cleanup() {
    await this.sandbox.deleteFile(this.tmpFilePath);
  }
}
