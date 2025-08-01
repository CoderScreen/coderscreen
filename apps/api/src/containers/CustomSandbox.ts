import { SpawnOptions } from 'node:child_process';
import { Sandbox } from '@cloudflare/sandbox';
import { RoomEntity } from '@coderscreen/db/room.db';
import { CodeRunner } from '@/containers/runners/base';
import { BashRunner } from '@/containers/runners/bash.runner';
import { CRunner } from '@/containers/runners/c.runner';
import { CppRunner } from '@/containers/runners/cpp.runner';
import { GoRunner } from '@/containers/runners/go.runner';
import { JavaRunner } from '@/containers/runners/java.runner';
import { JavaScriptRunner } from '@/containers/runners/js.runner';
import { PhpRunner } from '@/containers/runners/php.runner';
import { PythonRunner } from '@/containers/runners/python.runner';
import { RubyRunner } from '@/containers/runners/ruby.runner';
import { RustRunner } from '@/containers/runners/rust.runner';
import { TypescriptRunner } from '@/containers/runners/ts.runner';
import { AppContext } from '@/index';
import { ExecuteResponse } from '@/lib/sandbox';

export class CustomSandbox extends Sandbox<AppContext['Bindings']> {
  FALLBACK_TIMEOUT_MS = 15000; // 15 seconds
  defaultPort = 3000; // Port the container is listening on
  sleepAfter = '10m'; // Stop the instance if requests not sent for 1h

  async exec(
    command: string,
    args: string[],
    options?: { stream?: boolean; childOptions?: SpawnOptions }
  ): Promise<ExecuteResponse> {
    const start = Date.now();
    const result = await super.exec(command, args, {
      ...options,
      childOptions: {
        ...options?.childOptions,
        timeout: options?.childOptions?.timeout || this.FALLBACK_TIMEOUT_MS,
      },
    });
    const end = Date.now();
    const elapsedTime = end - start;

    if (!result) {
      return CodeRunner.emptyResponse;
    }

    if (result.exitCode === 2) {
      return CodeRunner.timeoutResponse;
    }

    return {
      id: crypto.randomUUID(),
      elapsedTime,
      ...result,
    };
  }

  async runCode(params: { language: RoomEntity['language']; code: string }) {
    const { language, code } = params;

    const runner: CodeRunner = (() => {
      switch (language) {
        case 'javascript':
          return new JavaScriptRunner(this, code);
        case 'typescript':
          return new TypescriptRunner(this, code);
        case 'python':
          return new PythonRunner(this, code);
        case 'bash':
          return new BashRunner(this, code);
        case 'c':
          return new CRunner(this, code);
        case 'c++':
          return new CppRunner(this, code);
        case 'go':
          return new GoRunner(this, code);
        case 'rust':
          return new RustRunner(this, code);
        case 'php':
          return new PhpRunner(this, code);
        case 'ruby':
          return new RubyRunner(this, code);
        case 'java':
          return new JavaRunner(this, code);
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
    })();

    await runner.setup();
    const result = await runner.execute();
    this.ctx.waitUntil(runner.cleanup());

    return result;
  }
}
