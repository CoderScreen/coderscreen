import { RoomSchema } from '@coderscreen/api/schema/room';
import { ExecOutputSchema } from '@coderscreen/api/schema/sandbox';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { useRoomContext } from '@/contexts/RoomContext';
import { useRunRoomCode } from '@/query/publicRoom.query';

type ExecOutput = z.infer<typeof ExecOutputSchema>;

export function useCodeExecutionHistory() {
  const { provider, isReadOnly } = useRoomContext();
  const { runRoomCode, isLoading } = useRunRoomCode();
  const [history, setHistory] = useState<ExecOutput[]>([]);

  // Observe changes to the execution history in the main doc
  useEffect(() => {
    if (!provider || isReadOnly) return;

    const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');

    const updateHistory = () => {
      const historyArray = executionHistory.toArray();

      // user facing history should be in reverse order
      setHistory([...historyArray].reverse());
    };

    // Set initial history
    updateHistory();

    // Observe changes
    executionHistory.observe(updateHistory);

    return () => {
      executionHistory.unobserve(updateHistory);
    };
  }, [provider, isReadOnly]);

  // Run code and store result in history
  const executeCode = useCallback(
    async (code: string, language: RoomSchema['language']) => {
      if (!provider || isReadOnly) {
        return;
      }

      try {
        const result = await runRoomCode({ code, language });
        // Add to main doc
        const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');
        executionHistory.push([result]);

        return result;
      } catch (error) {
        const errorResult: ExecOutput = {
          success: false,
          timestamp: new Date().toISOString(),
          stdout: '',
          stderr: error instanceof Error ? error.message : 'Unknown error occurred',
          exitCode: 1,
          elapsedTime: -1,
          compileTime: undefined,
        };

        // Add error to main doc
        const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');
        executionHistory.push([errorResult]);

        throw error;
      }
    },
    [runRoomCode, provider, isReadOnly]
  );

  // Clear history from main doc
  const clearHistory = useCallback(() => {
    if (!provider || isReadOnly) return;

    const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');
    executionHistory.delete(0, executionHistory.length);
  }, [provider, isReadOnly]);

  return {
    history,
    executeCode,
    isLoading,
    clearHistory,
    provider,
  };
}
