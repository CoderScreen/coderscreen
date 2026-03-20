import { Button } from '@coderscreen/ui/button';
import { RiArrowLeftLine, RiLoader4Line, RiTimeLine } from '@remixicon/react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';

interface AssessmentHeaderProps {
  mode: 'overview' | 'coding';
  onBackToOverview?: () => void;
}

export const AssessmentHeader = ({ mode, onBackToOverview }: AssessmentHeaderProps) => {
  const {
    assessment,
    currentQuestion,
    currentQuestionIndex,
    submission,
    timeRemainingMs,
    isSaving,
  } = useTakeAssessment();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemainingMs === null || !submission?.expiresAt) return 'text-gray-600';
    const expiresAt = new Date(submission.expiresAt).getTime();
    const startedAt = new Date(submission.startedAt!).getTime();
    const totalMs = expiresAt - startedAt;
    const ratio = timeRemainingMs / totalMs;
    if (ratio > 0.5) return 'text-green-600';
    if (ratio > 0.1) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className='h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4'>
      {/* Left */}
      <div className='flex items-center gap-3'>
        {mode === 'overview' ? (
          <span className='font-semibold text-gray-900'>{assessment?.title}</span>
        ) : (
          <>
            <Button
              variant='secondary'
              onClick={onBackToOverview}
            >
              <RiArrowLeftLine className='size-4' />
              <span>Questions</span>
            </Button>
            <span className='font-semibold text-gray-900'>
              {currentQuestionIndex + 1}. {currentQuestion?.title}
            </span>
          </>
        )}
      </div>

      {/* Right */}
      <div className='flex items-center gap-3'>
        {mode === 'coding' && isSaving && (
          <span className='flex items-center gap-1 text-sm text-gray-400'>
            <RiLoader4Line className='size-4 animate-spin' />
            Saving...
          </span>
        )}

        {timeRemainingMs !== null && (
          <div className={`flex items-center gap-1.5 font-mono font-semibold ${getTimerColor()}`}>
            <RiTimeLine className='size-5' />
            {formatTime(timeRemainingMs)}
          </div>
        )}
      </div>
    </div>
  );
};
