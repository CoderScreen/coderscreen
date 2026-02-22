import { RiLoader4Line, RiPlayLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { type ExecOutput, useCodeExecution } from '@/query/realtime/execution.query';

export const SingleFileOutput = () => {
  const { provider } = useRoomContext();
  const { isLoading } = useCodeExecution();
  const [latestResult, setLatestResult] = useState<ExecOutput | null>(null);

  // Subscribe to Yjs executionHistory changes
  useEffect(() => {
    if (!provider) return;

    const history = provider.doc.getArray<ExecOutput>('executionHistory');

    const updateLatest = () => {
      if (history.length > 0) {
        setLatestResult(history.get(history.length - 1));
      }
    };

    // Set initial value
    updateLatest();

    // Listen for changes
    history.observe(updateLatest);
    return () => history.unobserve(updateLatest);
  }, [provider]);

  // Loading state
  if (isLoading) {
    return (
      <div className='h-full w-full bg-white flex items-center justify-center'>
        <div className='text-center'>
          <RiLoader4Line className='size-6 text-gray-400 animate-spin mx-auto mb-2' />
          <p className='text-sm text-gray-500'>Running...</p>
        </div>
      </div>
    );
  }

  // Empty state — no results yet
  if (!latestResult) {
    return (
      <div className='h-full w-full bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
            <RiPlayLine className='text-gray-400 size-5' />
          </div>
          <p className='text-sm text-gray-500'>Run your code to see output</p>
        </div>
      </div>
    );
  }

  // Result state — show stdout/stderr
  return (
    <div className='h-full w-full bg-white overflow-auto'>
      <pre className='p-4 text-sm font-mono whitespace-pre-wrap break-words'>
        {latestResult.stdout}
        {latestResult.stderr && <span className='text-red-600'>{latestResult.stderr}</span>}
      </pre>
    </div>
  );
};
