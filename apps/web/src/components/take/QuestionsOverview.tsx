import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { RiCodeLine, RiSendPlaneLine } from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useSubmitAssessment } from '@/query/candidateAssessment.query';

export const QuestionsOverview = () => {
  const { assessment, codeMap, saveCurrentCode, subId, token } = useTakeAssessment();
  const { submitAssessment, isSubmitting } = useSubmitAssessment(subId, token);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const navigate = useNavigate();

  const questions = assessment?.questions ?? [];

  const isStarted = (questionId: string) => {
    const code = codeMap[questionId];
    if (!code) return false;
    const question = questions.find((q) => q.id === questionId);
    const starter = question?.starterCode ?? '';
    return code !== starter && code.trim().length > 0;
  };

  const handleSelectQuestion = (questionId: string) => {
    saveCurrentCode();
    navigate({
      to: '/take/$subId/question/$questionId',
      params: { subId, questionId },
      search: { token },
    });
  };

  const handleSubmit = async () => {
    await saveCurrentCode();
    await submitAssessment();
    setShowSubmitDialog(false);
  };

  return (
    <>
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-3xl mx-auto px-6 py-10'>
          <h1 className='text-xl font-semibold text-gray-900 mb-1'>Questions</h1>
          <p className='text-gray-500 mb-6'>
            Click a question to start coding. You can switch between questions at any time.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
            {questions.map((q, i) => {
              const started = isStarted(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.id)}
                  className='text-left border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-2.5'>
                      <span className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors'>
                        {i + 1}
                      </span>
                      <span className='font-medium text-gray-900'>{q.title}</span>
                    </div>
                    <RiCodeLine className='size-5 text-gray-300 group-hover:text-blue-400 transition-colors mt-1' />
                  </div>
                  <div className='mt-3 ml-10'>
                    <span
                      className={`inline-flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full ${
                        started
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {started ? 'Started' : 'Not started'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className='flex justify-end'>
            <Button
              icon={RiSendPlaneLine}
              onClick={() => setShowSubmitDialog(true)}
            >
              Submit Assessment
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Submit Assessment?</DialogTitle>
            <DialogDescription>
              This will run all test cases (including hidden ones) and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='secondary' onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button
              icon={RiSendPlaneLine}
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
