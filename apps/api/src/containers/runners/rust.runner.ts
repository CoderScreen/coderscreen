import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class RustRunner extends CodeRunner {
  private sourceFilePath = 'tmp.rs';
  private executablePath = 'tmp';

  async setup() {
    // Create a temp Rust source file
    await this.sandbox.writeFile(this.sourceFilePath, this.code);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    // First compile the Rust code
    const compileResult = await this.sandbox.exec('rustc', [
      '-o',
      this.executablePath,
      this.sourceFilePath,
    ]);

    // If compilation failed, return the compilation error
    if (!compileResult.success) {
      return compileResult;
    }

    // If compilation succeeded, run the executable
    const runResult = await this.sandbox.exec(`./${this.executablePath}`, []);

    return {
      ...runResult,
      compileTime: compileResult.elapsedTime,
    };
  }

  async cleanup() {
    // Clean up both source file and executable
    await this.sandbox.deleteFile(this.sourceFilePath);
    await this.sandbox.deleteFile(this.executablePath);
  }
}
