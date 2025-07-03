import { useCodeExecutionHistory } from '@/query/realtime/execution.query';

export const CodeOutput = () => {
  const { history } = useCodeExecutionHistory();

  if (!history.length) {
    return (
      <div className='h-full w-full bg-white'>
        <div className='p-4 h-full overflow-auto'>
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='text-gray-300 text-4xl mb-3'>📝</div>
              <p className='text-gray-500 text-sm'>No output yet</p>
              <p className='text-gray-400 text-xs mt-1'>
                Run your code to see the results here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full w-full bg-white'>
      <div className='p-4 h-full overflow-auto'>
        {history.map((data, idx) => {
          const hasOutput = data.output && data.output.trim() !== '';
          const hasError = data.error && data.error.trim() !== '';
          return (
            <div className='space-y-2 mb-6' key={data.timestamp + idx}>
              <div className='text-xs text-gray-400 mb-1'>
                Ran at {new Date(data.timestamp).toLocaleTimeString()} (
                {data.language})
              </div>
              {hasError && (
                <pre className='text-sm text-red-600 font-mono whitespace-pre-wrap break-words leading-relaxed bg-red-50 p-3 rounded border border-red-200'>
                  <code>Error: {data.error}</code>
                </pre>
              )}
              {hasOutput && (
                <pre className='text-sm text-gray-800 font-mono whitespace-pre-wrap break-words leading-relaxed bg-gray-50 p-3 rounded border border-gray-200'>
                  <code>{data.output}</code>
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
