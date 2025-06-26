import { useCodeExecutionWebSocket } from '@/query/codeExecution.query';

export const CodeOutput = () => {
  const { data, isConnected } = useCodeExecutionWebSocket();

  const hasOutput = data.output && data.output.trim() !== '';
  const hasError = data.error && data.error.trim() !== '';

  return (
    <div className='h-full w-full bg-white'>
      <div className='p-4 h-full overflow-auto'>
        {/* Connection Status Indicator */}
        <div className='flex items-center gap-2 mb-3 text-xs'>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {data.isRunning && (
            <span className='text-blue-600 flex items-center gap-1'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
              Running...
            </span>
          )}
        </div>

        {/* Output Content */}
        {hasOutput || hasError ? (
          <div className='space-y-2'>
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
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='text-gray-300 text-4xl mb-3'>📝</div>
              <p className='text-gray-500 text-sm'>No output yet</p>
              <p className='text-gray-400 text-xs mt-1'>
                Run your code to see the results here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
