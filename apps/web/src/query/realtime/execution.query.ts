import { RoomSchema } from '@coderscreen/api/schema/room';
import { ExecOutputSchema } from '@coderscreen/api/schema/sandbox';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { getSingleFileTemplateFileName } from '@/components/room/editor/lib/languageTemplate';
import { useRoomContext } from '@/contexts/RoomContext';
import { findFileIdByPath } from '@/contexts/SandpackContext';
import { useRunRoomCode, useStopRoomCode } from '@/query/publicRoom.query';
import { FS_MAP_KEY, FSEntry, getFileKey } from '@/query/realtime/multi-file/docUtils';

type ExecOutput = z.infer<typeof ExecOutputSchema>;

export function useCodeExecutionHistory() {
  const { provider, isReadOnly } = useRoomContext();
  const { runRoomCode, abortRun, isLoading } = useRunRoomCode();
  const { stopRoomCode } = useStopRoomCode();
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
  const executeCode = useCallback(async () => {
    if (!provider || isReadOnly) {
      return;
    }

    try {
      const language = provider.doc.getText('language').toJSON() as RoomSchema['language'];
      const filePath = getSingleFileTemplateFileName(language);

      const fsMap = provider.doc.getMap<FSEntry>(FS_MAP_KEY);
      const fileId = findFileIdByPath(fsMap, filePath);

      if (!fileId) {
        throw new Error('File not found');
      }

      const code = provider.doc.getText(getFileKey(fileId)).toJSON() as string;

      const result = await runRoomCode({ code, language });
      // Add to main doc
      const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');
      executionHistory.push([result]);

      return result;
    } catch (error) {
      // Don't record aborted requests (user clicked Stop)
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

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
  }, [runRoomCode, provider, isReadOnly]);

  // Stop a running execution: abort the in-flight request and kill sandbox processes
  const stopExecution = useCallback(async () => {
    abortRun();
    try {
      await stopRoomCode();
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  }, [abortRun, stopRoomCode]);

  // Clear history from main doc
  const clearHistory = useCallback(() => {
    if (!provider || isReadOnly) return;

    const executionHistory = provider.doc.getArray<ExecOutput>('executionHistory');
    executionHistory.delete(0, executionHistory.length);
  }, [provider, isReadOnly]);

  return {
    history,
    executeCode,
    stopExecution,
    isLoading,
    clearHistory,
    provider,
  };
}
