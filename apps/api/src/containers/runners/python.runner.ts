import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class PythonRunner extends CodeRunner {
  private tmpFilePath = 'tmp.py';

  async setup() {
    // Create a temp file
    await this.sandbox.writeFile(this.tmpFilePath, this.code);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    const result = await this.sandbox.exec('python', [this.tmpFilePath]);

    return result;
  }

  async cleanup() {
    await this.sandbox.deleteFile(this.tmpFilePath);
  }
}
