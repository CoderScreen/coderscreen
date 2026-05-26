import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { RiArrowLeftLine, RiArrowGoBackLine, RiLoader4Line, RiTimeLine } from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';

interface AssessmentHeaderProps {
  mode: 'overview' | 'coding';
  question?: { id: string; title: string };
  questionIndex?: number;
}

export const AssessmentHeader = ({ mode, question, questionIndex }: AssessmentHeaderProps) => {
  const { assessment, submission, timeRemainingMs, isSaving, saveCurrentCode, subId, token } =
    useTakeAssessment();
  const [showBackDialog, setShowBackDialog] = useState(false);
  const navigate = useNavigate();

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

  const handleBackToOverview = () => {
    setShowBackDialog(false);
    saveCurrentCode();
    navigate({
      to: '/take/$subId',
      params: { subId },
      search: { token },
    });
  };

  return (
    <>
      <div className='h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4'>
        {/* Left */}
        <div className='flex items-center gap-3'>
          {mode === 'overview' ? (
            <span className='font-semibold text-gray-900'>{assessment?.title}</span>
          ) : (
            <>
              <Button variant='secondary' onClick={() => setShowBackDialog(true)}>
                <RiArrowLeftLine className='size-4' />
                <span>Questions</span>
              </Button>
              <span className='font-semibold text-gray-900'>
                {questionIndex !== undefined ? `${questionIndex + 1}. ` : ''}
                {question?.title}
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
            <div
              className={`flex items-center gap-1.5 font-mono font-semibold ${getTimerColor()}`}
            >
              <RiTimeLine className='size-5' />
              {formatTime(timeRemainingMs)}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Go back to questions?</DialogTitle>
            <DialogDescription>
              Submit your code before leaving so your progress is saved. You can always come back and
              try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4'>
            <Button
              variant='secondary'
              icon={RiArrowLeftLine}
              onClick={() => setShowBackDialog(false)}
            >
              Stay here
            </Button>
            <Button icon={RiArrowGoBackLine} onClick={handleBackToOverview}>
              Go back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
