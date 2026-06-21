import { RiCheckboxCircleLine, RiTimeLine } from '@remixicon/react';

interface AssessmentCompletedViewProps {
  status: 'submitted' | 'expired';
}

export const AssessmentCompletedView = ({ status }: AssessmentCompletedViewProps) => {
  const isSubmitted = status === 'submitted';

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md mx-4'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center'>
          {isSubmitted ? (
            <>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4'>
                <RiCheckboxCircleLine className='w-8 h-8 text-green-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>Assessment Submitted</h1>
              <p className='text-sm text-gray-500'>
                Your responses have been recorded. You may close this window.
              </p>
            </>
          ) : (
            <>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4'>
                <RiTimeLine className='w-8 h-8 text-amber-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>Time&apos;s Up</h1>
              <p className='text-sm text-gray-500'>
                Your latest saved code has been recorded. You may close this window.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
