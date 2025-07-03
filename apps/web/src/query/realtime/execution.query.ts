import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { useRunRoomCode } from '@/query/publicRoom.query';
import * as Y from 'yjs';

export interface CodeExecutionResult {
  code: string;
  output: string;
  error: string;
  language: string;
  timestamp: number;
}

export function useCodeExecutionHistory() {
  const { provider } = useRoomContext();
  const { runRoomCode, isLoading } = useRunRoomCode();
  const [history, setHistory] = useState<CodeExecutionResult[]>([]);

  // Observe changes to the execution history in the main doc
  useEffect(() => {
    if (!provider) return;

    const executionHistory =
      provider.doc.getArray<CodeExecutionResult>('executionHistory');

    const updateHistory = () => {
      const historyArray = executionHistory.toArray();
      setHistory(historyArray);
    };

    // Set initial history
    updateHistory();

    // Observe changes
    executionHistory.observe(updateHistory);

    return () => {
      executionHistory.unobserve(updateHistory);
    };
  }, [provider]);

  // Run code and store result in history
  const executeCode = useCallback(
    async (code: string, language: string) => {
      if (!provider) return;

      try {
        const result = await runRoomCode({ code, language });

        const executionResult: CodeExecutionResult = {
          code,
          output: result.codeOutput ?? '',
          error: '', // API doesn't return errors separately, they're in codeOutput
          language,
          timestamp: Date.now(),
        };

        // Add to main doc
        const executionHistory =
          provider.doc.getArray<CodeExecutionResult>('executionHistory');
        executionHistory.unshift([executionResult]);

        return result;
      } catch (error) {
        const errorResult: CodeExecutionResult = {
          code,
          output: '',
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
          language,
          timestamp: Date.now(),
        };

        // Add error to main doc
        const executionHistory =
          provider.doc.getArray<CodeExecutionResult>('executionHistory');
        executionHistory.unshift([errorResult]);

        throw error;
      }
    },
    [runRoomCode, provider]
  );

  // Clear history from main doc
  const clearHistory = useCallback(() => {
    if (!provider) return;

    const executionHistory =
      provider.doc.getArray<CodeExecutionResult>('executionHistory');
    executionHistory.delete(0, executionHistory.length);
  }, [provider]);

  return {
    history,
    executeCode,
    isLoading,
    clearHistory,
    provider,
  };
}
