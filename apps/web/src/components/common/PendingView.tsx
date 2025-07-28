export function PendingView() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-gray-50'>
      <div className='flex flex-col items-center justify-center space-y-4'>
        {/* Loading spinner */}
        <div className='relative'>
          <div className='h-12 w-12 rounded-full border-4 border-gray-200'></div>
          <div className='absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-500'></div>
        </div>

        {/* Loading text */}
        <div className='text-center'>
          <h2 className='text-lg font-medium text-muted-foreground'>
            Loading
            <span className='inline-block animate-pulse'>.</span>
            <span className='inline-block animate-pulse [animation-delay:0.2s]'>.</span>
            <span className='inline-block animate-pulse [animation-delay:0.4s]'>.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
