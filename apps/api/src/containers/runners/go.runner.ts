import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class GoRunner extends CodeRunner {
  private sourceFilePath = 'tmp.go';

  async setup() {
    // Create a temp Go source file
    await this.sandbox.writeFile(this.sourceFilePath, this.code);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    const compileResult = await this.sandbox.exec('go build', [this.sourceFilePath]);

    if (!compileResult.success) {
      return compileResult;
    }

    const result = await this.sandbox.exec(`./${this.sourceFilePath.replace('.go', '')}`, []);

    return {
      ...result,
      compileTime: compileResult.elapsedTime,
    };
  }

  async cleanup() {
    // Clean up the source file
    await this.sandbox.deleteFile(this.sourceFilePath);
  }
}
