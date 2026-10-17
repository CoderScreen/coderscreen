import { RoomSchema } from '@coderscreen/api/schema/room';
import { useCallback, useRef, useState } from 'react';
import * as Y from 'yjs';
import { useRoomContext } from '@/contexts/RoomContext';
import { useRunRoomCode, useStopRoomCode } from '@/query/publicRoom.query';

export interface ExecOutput {
  success: boolean;
  timestamp: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  elapsedTime: number;
  compileTime?: number;
}

// Every run is saved in the shared room document, and the output panel only
// shows the latest one. Cap what each run stores and how many runs are kept so
// a chatty program can't bloat the document past what the room can save.
const MAX_STORED_OUTPUT_CHARS = 10_000;
const MAX_STORED_RUNS = 5;

const truncateOutput = (output: string) =>
  output.length > MAX_STORED_OUTPUT_CHARS
    ? `${output.slice(0, MAX_STORED_OUTPUT_CHARS)}\n... output truncated (${output.length - MAX_STORED_OUTPUT_CHARS} more characters)`
    : output;

const pushExecution = (doc: Y.Doc, result: ExecOutput) => {
  const history = doc.getArray<ExecOutput>('executionHistory');
  doc.transact(() => {
    history.push([
      { ...result, stdout: truncateOutput(result.stdout), stderr: truncateOutput(result.stderr) },
    ]);
    if (history.length > MAX_STORED_RUNS) {
      history.delete(0, history.length - MAX_STORED_RUNS);
    }
  });
};

export function useCodeExecution() {
  const { provider, isReadOnly } = useRoomContext();
  const { runRoomCode } = useRunRoomCode();
  const { stopRoomCode } = useStopRoomCode();
  const [isLoading, setIsLoading] = useState(false);
  const stoppedRef = useRef(false);

  const executeCode = useCallback(async () => {
    if (!provider || isReadOnly) return;

    const language = provider.doc.getText('language').toJSON() as RoomSchema['language'];

    setIsLoading(true);
    stoppedRef.current = false;

    try {
      const result = (await runRoomCode({ language })) as ExecOutput;

      // If stopped while waiting, don't push the result
      if (stoppedRef.current) return;

      // Store result in Yjs executionHistory for cross-participant sync
      pushExecution(provider.doc, result);
    } catch (error) {
      if (stoppedRef.current) return;
      console.error('Code execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isReadOnly, runRoomCode]);

  const stopExecution = useCallback(async () => {
    stoppedRef.current = true;
    setIsLoading(false);

    // Push a "stopped" entry so the output panel shows it
    if (provider) {
      pushExecution(provider.doc, {
        success: false,
        timestamp: new Date().toISOString(),
        stdout: '',
        stderr: 'Execution stopped by user',
        exitCode: -1,
        elapsedTime: -1,
      });
    }

    // Kill processes on the server
    try {
      await stopRoomCode();
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  }, [stopRoomCode, provider]);

  return {
    executeCode,
    stopExecution,
    isLoading,
  };
}
