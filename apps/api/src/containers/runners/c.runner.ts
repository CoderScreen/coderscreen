import { CodeRunner } from '@/containers/runners/base';
import { ExecuteResponse } from '@/lib/sandbox';

export class CRunner extends CodeRunner {
  private sourceFilePath = 'tmp.c';
  private executablePath = 'tmp';

  async setup() {
    // Create a temp C source file
    await this.sandbox.writeFile(this.sourceFilePath, this.code);
    return;
  }

  async executeInternal(): Promise<ExecuteResponse> {
    // First compile the C code
    const compileResult = await this.sandbox.exec('gcc', [
      '-o',
      this.executablePath,
      this.sourceFilePath,
      '-Wall', // Enable all warnings
      '-Wextra', // Enable extra warnings
      '-std=c99', // Use C99 standard
    ]);

    // If compilation failed, return the compilation error
    if (compileResult && !compileResult.success) {
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
