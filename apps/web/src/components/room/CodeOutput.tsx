import { useRoomCodeResult } from '@/query/room.query';

export const CodeOutput = () => {
  const { roomCodeResult } = useRoomCodeResult();

  const hasOutput =
    roomCodeResult?.codeOutput && roomCodeResult.codeOutput.trim() !== '';

  return (
    <div className='h-full w-full bg-white'>
      <div className='p-4 h-full overflow-auto'>
        {hasOutput ? (
          <pre className='text-sm text-gray-800 font-mono whitespace-pre-wrap break-words leading-relaxed'>
            <code>{roomCodeResult.codeOutput}</code>
          </pre>
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
