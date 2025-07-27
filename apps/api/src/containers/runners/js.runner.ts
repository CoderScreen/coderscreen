import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class JavaScriptRunner extends CodeRunner {
  private tmpFilePath = 'tmp.js';

  async setup() {
    // Create a temp file
    await this.sandbox.writeFile(this.tmpFilePath, this.code);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    const result = await this.sandbox.exec('node', [this.tmpFilePath]);

    return result;
  }

  async cleanup() {
    await this.sandbox.deleteFile(this.tmpFilePath);
  }
}
