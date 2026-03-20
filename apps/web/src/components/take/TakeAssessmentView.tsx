import { RiErrorWarningLine, RiLoader4Line } from '@remixicon/react';
import { useSearch } from '@tanstack/react-router';
import { useCurrentSubId } from '@/lib/params';
import { TakeAssessmentProvider, useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { AssessmentStartView } from './AssessmentStartView';
import { AssessmentCodingView } from './AssessmentCodingView';
import { AssessmentCompletedView } from './AssessmentCompletedView';

export const TakeAssessmentView = () => {
  const subId = useCurrentSubId();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token;

  if (!token) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center space-y-3'>
          <RiErrorWarningLine className='w-12 h-12 text-red-400 mx-auto' />
          <h2 className='text-lg font-semibold text-gray-900'>Invalid Link</h2>
          <p className='text-sm text-gray-500'>This assessment link is missing a valid token.</p>
        </div>
      </div>
    );
  }

  return (
    <TakeAssessmentProvider subId={subId} token={token}>
      <TakeAssessmentInner />
    </TakeAssessmentProvider>
  );
};

const TakeAssessmentInner = () => {
  const { submission, isLoading, isError } = useTakeAssessment();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <RiLoader4Line className='w-8 h-8 text-gray-400 animate-spin' />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center space-y-3'>
          <RiErrorWarningLine className='w-12 h-12 text-red-400 mx-auto' />
          <h2 className='text-lg font-semibold text-gray-900'>Invalid or Expired Link</h2>
          <p className='text-sm text-gray-500'>
            This assessment link is no longer valid. Please contact the person who sent it to you.
          </p>
        </div>
      </div>
    );
  }

  switch (submission.status) {
    case 'not_started':
      return <AssessmentStartView />;
    case 'in_progress':
      return <AssessmentCodingView />;
    case 'submitted':
    case 'graded':
      return <AssessmentCompletedView status='submitted' />;
    case 'expired':
      return <AssessmentCompletedView status='expired' />;
    default:
      return <AssessmentCompletedView status='submitted' />;
  }
};
