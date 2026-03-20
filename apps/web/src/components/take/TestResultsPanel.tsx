import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiPlayLine,
  RiSendPlaneLine,
} from '@remixicon/react';
import { useEffect, useState } from 'react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useSubmitAssessment } from '@/query/candidateAssessment.query';

interface TestResult {
  testCaseId: string;
  label?: string;
  input?: string;
  expectedOutput?: string;
  actualOutput: string;
  stderr: string;
  passed: boolean;
  executionTimeMs: number;
}

interface TestCase {
  id: string;
  label?: string;
  input?: string;
  expectedOutput?: string;
}

interface TestResultsPanelProps {
  testCases: TestCase[];
  results: TestResult[] | null;
  isRunning: boolean;
  onRunTests: () => void;
}

export const TestResultsPanel = ({
  testCases,
  results,
  isRunning,
  onRunTests,
}: TestResultsPanelProps) => {
  const { saveCurrentCode, subId, token } = useTakeAssessment();
  const { submitAssessment, isSubmitting } = useSubmitAssessment(subId, token);
  const [activeTab, setActiveTab] = useState<'testCases' | 'results'>('testCases');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Auto-switch to results tab when results arrive
  useEffect(() => {
    if (results) {
      setActiveTab('results');
    }
  }, [results]);

  const handleSubmit = async () => {
    await saveCurrentCode();
    await submitAssessment();
    setShowSubmitDialog(false);
  };

  const passed = results?.filter((r) => r.passed).length ?? 0;

  return (
    <>
      <div className='h-full flex flex-col'>
        {/* Tab bar with actions */}
        <div className='flex items-center justify-between border-b border-gray-200 px-3'>
          <div className='flex items-center gap-1'>
            <button
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'testCases'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('testCases')}
            >
              Test Cases
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('results')}
            >
              Results
              {results && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    passed === results.length
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {passed}/{results.length}
                </span>
              )}
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              icon={RiPlayLine}
              onClick={onRunTests}
              isLoading={isRunning}
            >
              Run Tests
            </Button>
            <Button
              icon={RiSendPlaneLine}
              onClick={() => setShowSubmitDialog(true)}
            >
              Submit
            </Button>
          </div>
        </div>

        {/* Tab content */}
        <div className='flex-1 overflow-y-auto'>
          {activeTab === 'testCases' ? (
            <TestCasesContent testCases={testCases} />
          ) : (
            <ResultsContent
              results={results}
              isRunning={isRunning}
            />
          )}
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
            <Button icon={RiSendPlaneLine} onClick={handleSubmit} isLoading={isSubmitting}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TestCasesContent = ({ testCases }: { testCases: TestCase[] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (testCases.length === 0) {
    return (
      <div className='h-full flex items-center justify-center'>
        <span className='text-sm text-gray-400'>No visible test cases</span>
      </div>
    );
  }

  const selected = testCases[selectedIndex];

  return (
    <div className='h-full flex flex-col'>
      {/* Case pills */}
      <div className='flex items-center gap-1 px-4 pt-3 pb-2'>
        {testCases.map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
              i === selectedIndex
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedIndex(i)}
          >
            Case {i + 1}
          </button>
        ))}
      </div>

      {/* Selected case fields */}
      <div className='flex-1 overflow-y-auto px-4 pb-4 space-y-4'>
        {selected?.input && (
          <div>
            <p className='text-sm text-gray-500 mb-1.5'>Input =</p>
            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900'>
              {selected.input}
            </div>
          </div>
        )}
        {selected?.expectedOutput && (
          <div>
            <p className='text-sm text-gray-500 mb-1.5'>Expected Output =</p>
            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900'>
              {selected.expectedOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultsContent = ({
  results,
  isRunning,
}: {
  results: TestResult[] | null;
  isRunning: boolean;
}) => {
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [showPassed, setShowPassed] = useState(false);

  if (isRunning) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <RiLoader4Line className='size-4 animate-spin' />
          Running tests...
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='flex items-center gap-2 text-sm text-gray-400'>
          <RiPlayLine className='size-4' />
          Click &quot;Run Tests&quot; to test your code
        </div>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return (
    <div className='h-full flex flex-col'>
      {/* Summary bar */}
      <div className='flex items-center gap-3 px-4 py-2 border-b border-gray-100'>
        <span className='text-sm font-medium text-gray-700'>
          {results.length} tests
        </span>
        {passedCount > 0 && (
          <span className='flex items-center gap-1 text-sm text-green-600'>
            <RiCheckLine className='size-4' />
            {passedCount} passed
          </span>
        )}
        {failedCount > 0 && (
          <span className='flex items-center gap-1 text-sm text-red-600'>
            <RiCloseLine className='size-4' />
            {failedCount} failed
          </span>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {/* Failed cases — always visible, clickable to expand */}
        {failedCount > 0 && (
          <div className='px-4 pt-3 pb-2'>
            <p className='text-sm font-medium text-red-600 mb-2'>Failed</p>
            <div className='space-y-1'>
              {results.map((result, index) => {
                if (result.passed) return null;
                const isExpanded = expandedCase === result.testCaseId;
                return (
                  <div key={result.testCaseId}>
                    <button
                      className='w-full flex items-center gap-2 py-2 px-3 rounded hover:bg-red-50 cursor-pointer transition-colors'
                      onClick={() => setExpandedCase(isExpanded ? null : result.testCaseId)}
                    >
                      <RiCloseLine className='size-4 text-red-500 shrink-0' />
                      <span className='flex-1 text-left text-sm text-gray-700'>
                        Case {index + 1}
                      </span>

                      {isExpanded ? (
                        <RiArrowDownSLine className='size-4 text-gray-400' />
                      ) : (
                        <RiArrowRightSLine className='size-4 text-gray-400' />
                      )}
                    </button>

                    {isExpanded && (
                      <div className='pl-9 pr-3 pb-3 pt-1 space-y-3'>
                        {result.input && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Input =</p>
                            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900'>
                              {result.input}
                            </div>
                          </div>
                        )}
                        {result.expectedOutput && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Expected Output =</p>
                            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900'>
                              {result.expectedOutput}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className='text-sm text-gray-500 mb-1.5'>Your Output =</p>
                          <div className='bg-red-50 rounded-lg px-4 py-3 font-mono text-sm text-red-700'>
                            {result.actualOutput || '(empty)'}
                          </div>
                        </div>
                        {result.stderr && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Stderr =</p>
                            <div className='bg-red-50 rounded-lg px-4 py-3 font-mono text-sm text-red-700'>
                              {result.stderr}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Passed cases — collapsed behind toggle */}
        {passedCount > 0 && (
          <div className='px-4 pt-3 pb-3'>
            <button
              className='flex items-center gap-1 text-sm font-medium text-green-600 mb-2 cursor-pointer hover:text-green-700 transition-colors'
              onClick={() => setShowPassed(!showPassed)}
            >
              {showPassed ? (
                <RiArrowDownSLine className='size-4' />
              ) : (
                <RiArrowRightSLine className='size-4' />
              )}
              {passedCount} Passed
            </button>

            {showPassed && (
              <div className='space-y-1'>
                {results.map((result, index) => {
                  if (!result.passed) return null;
                  return (
                    <div
                      key={result.testCaseId}
                      className='flex items-center gap-2 py-1.5 px-3 rounded bg-green-50 text-sm text-green-700'
                    >
                      <RiCheckLine className='size-4 shrink-0' />
                      <span className='flex-1'>Case {index + 1}</span>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
