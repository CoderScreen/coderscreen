import { Id } from '@coderscreen/common/id';

export const getSandboxId = (roomId: Id<'room'>) => {
  return `s_${roomId}`;
};

export interface ExecuteResponse {
  id: string;
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  args: string[];
  timestamp: string;
  elapsedTime: number;
  // only needed for compiled languages
  compileTime?: number;
}

export interface FormattedOutput {
  success: boolean;
  timestamp: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  elapsedTime: number;
  compileTime?: number;
}

export const formatExecOutput = (output: ExecuteResponse): FormattedOutput => {
  if (!output) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      stdout: '',
      stderr: 'No output from execution',
      exitCode: 0,
      elapsedTime: -1, // -1 means no execution was done
      compileTime: undefined,
    };
  }

  return {
    success: output.success,
    timestamp: output.timestamp,
    stdout: output.stdout,
    stderr: output.stderr,
    exitCode: output.exitCode,
    elapsedTime: output.elapsedTime,
    compileTime: output.compileTime,
  };
};
