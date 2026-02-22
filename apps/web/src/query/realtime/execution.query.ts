import { RoomSchema } from '@coderscreen/api/schema/room';
import { useCallback, useRef, useState } from 'react';
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
      const history = provider.doc.getArray<ExecOutput>('executionHistory');
      history.push([result]);
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
      const history = provider.doc.getArray<ExecOutput>('executionHistory');
      history.push([
        {
          success: false,
          timestamp: new Date().toISOString(),
          stdout: '',
          stderr: 'Execution stopped by user',
          exitCode: -1,
          elapsedTime: -1,
        },
      ]);
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
