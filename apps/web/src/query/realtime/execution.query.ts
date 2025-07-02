import { useCallback, useEffect, useState, useRef } from 'react';
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
  const subdocRef = useRef<Y.Doc | null>(null);

  // Create or get the subdoc for execution history
  useEffect(() => {
    if (!provider) return;

    const subdoc = provider.doc.getMap('subdocs').get('execution') as Y.Doc;
    if (!subdoc) {
      const newSubdoc = new Y.Doc();
      provider.doc.getMap('subdocs').set('execution', newSubdoc);
      subdocRef.current = newSubdoc;
    } else {
      subdocRef.current = subdoc;
    }
  }, [provider]);

  // Observe changes to the execution history in the subdoc
  useEffect(() => {
    if (!subdocRef.current) return;

    const executionHistory =
      subdocRef.current.getArray<CodeExecutionResult>('executionHistory');

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
  }, [subdocRef.current]);

  // Run code and store result in history
  const executeCode = useCallback(
    async (code: string, language: string) => {
      if (!subdocRef.current) return;

      try {
        const result = await runRoomCode({ code, language });

        const executionResult: CodeExecutionResult = {
          code,
          output: result.codeOutput ?? '',
          error: '', // API doesn't return errors separately, they're in codeOutput
          language,
          timestamp: Date.now(),
        };

        // Add to subdoc
        const executionHistory =
          subdocRef.current.getArray<CodeExecutionResult>('executionHistory');
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

        // Add error to subdoc
        const executionHistory =
          subdocRef.current.getArray<CodeExecutionResult>('executionHistory');
        executionHistory.unshift([errorResult]);

        throw error;
      }
    },
    [runRoomCode]
  );

  // Clear history from subdoc
  const clearHistory = useCallback(() => {
    if (!subdocRef.current) return;

    const executionHistory =
      subdocRef.current.getArray<CodeExecutionResult>('executionHistory');
    executionHistory.delete(0, executionHistory.length);
  }, []);

  return {
    history,
    executeCode,
    isLoading,
    clearHistory,
    provider,
  };
}
