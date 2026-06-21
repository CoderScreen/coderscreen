import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import {
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiCloseLine,
  RiHistoryLine,
  RiLoader4Line,
  RiPlayLine,
  RiSendPlaneLine,
} from '@remixicon/react';
import { useEffect, useState } from 'react';
import { formatDatetime } from '@/lib/dateUtils';

export type TestCaseFailureReason = 'passed' | 'compile' | 'timeout' | 'crash' | 'wrong_output';

const FAILURE_LABEL: Record<Exclude<TestCaseFailureReason, 'passed'>, string> = {
  compile: 'Compile error',
  timeout: 'Timed out',
  crash: 'Runtime error',
  wrong_output: 'Wrong output',
};

interface TestResult {
  testCaseId: string;
  label?: string;
  args?: unknown[];
  expectedReturn?: unknown;
  failureReason?: TestCaseFailureReason;
  actualOutput: string;
  stderr: string;
  passed: boolean;
  executionTimeMs: number;
}

interface TestCase {
  id: string;
  label?: string;
  args: unknown[];
  expectedReturn: unknown;
}

interface SubmissionHistoryItem {
  id: string;
  createdAt: string;
  code: string;
  score: number | null;
  maxScore: number | null;
}

interface TestResultsPanelProps {
  testCases: TestCase[];
  functionName: string;
  results: TestResult[] | null;
  isRunning: boolean;
  onRunTests: () => void;
  onSubmitCode: () => void;
  isSubmitting: boolean;
  history: SubmissionHistoryItem[];
  onRestoreCode: (code: string) => void;
}

export const TestResultsPanel = ({
  testCases,
  functionName,
  results,
  isRunning,
  onRunTests,
  onSubmitCode,
  isSubmitting,
  history,
  onRestoreCode,
}: TestResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'testCases' | 'results' | 'history'>('testCases');

  // Auto-switch to results tab when results arrive
  useEffect(() => {
    if (results) {
      setActiveTab('results');
    }
  }, [results]);

  const passed = results?.filter((r) => r.passed).length ?? 0;

  return (
    <div className='h-full flex flex-col'>
      {/* Tab bar with actions */}
      <div className='flex items-center justify-between border-b border-gray-200 px-3 py-2 gap-4'>
        <Tabs value={activeTab}>
          <TabsList variant='solid'>
            <TabsTrigger value='testCases' onClick={() => setActiveTab('testCases')}>
              Test Cases
            </TabsTrigger>
            <TabsTrigger value='results' onClick={() => setActiveTab('results')}>
              Results
              {results && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ml-1 ${
                    passed === results.length
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {passed}/{results.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='history' onClick={() => setActiveTab('history')}>
              History
              {history.length > 0 && (
                <span className='text-xs px-1.5 py-0.5 rounded-full font-semibold ml-1 bg-gray-200 text-gray-700'>
                  {history.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex items-center gap-2'>
          <Button variant='secondary' icon={RiPlayLine} onClick={onRunTests} isLoading={isRunning}>
            Run
          </Button>
          <Button icon={RiSendPlaneLine} onClick={onSubmitCode} isLoading={isSubmitting}>
            Submit
          </Button>
        </div>
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-y-auto'>
        {activeTab === 'testCases' ? (
          <TestCasesContent testCases={testCases} functionName={functionName} />
        ) : activeTab === 'results' ? (
          <ResultsContent results={results} isRunning={isRunning} functionName={functionName} />
        ) : (
          <HistoryContent history={history} onRestoreCode={onRestoreCode} />
        )}
      </div>
    </div>
  );
};

const formatCall = (functionName: string, args: unknown[]): string => {
  const formatted = args.map((a) => JSON.stringify(a)).join(', ');
  return `${functionName}(${formatted})`;
};

const formatReturn = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 0);
  } catch {
    return String(value);
  }
};

const TestCasesContent = ({
  testCases,
  functionName,
}: {
  testCases: TestCase[];
  functionName: string;
}) => {
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

      {/* Selected case rendered as function call → expected return */}
      <div className='flex-1 overflow-y-auto px-4 pb-4 space-y-4'>
        {selected && (
          <>
            <div>
              <p className='text-sm text-gray-500 mb-1.5'>Call</p>
              <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 whitespace-pre-wrap break-all'>
                {formatCall(functionName, selected.args)}
              </div>
            </div>
            <div>
              <p className='text-sm text-gray-500 mb-1.5'>Expected return</p>
              <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 whitespace-pre-wrap break-all'>
                {formatReturn(selected.expectedReturn)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ResultsContent = ({
  results,
  isRunning,
  functionName,
}: {
  results: TestResult[] | null;
  isRunning: boolean;
  functionName: string;
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
        <span className='text-sm font-medium text-gray-700'>{results.length} tests</span>
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
                      {result.failureReason && result.failureReason !== 'passed' && (
                        <span className='text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700'>
                          {FAILURE_LABEL[result.failureReason]}
                        </span>
                      )}

                      {isExpanded ? (
                        <RiArrowDownSLine className='size-4 text-gray-400' />
                      ) : (
                        <RiArrowRightSLine className='size-4 text-gray-400' />
                      )}
                    </button>

                    {isExpanded && (
                      <div className='pl-9 pr-3 pb-3 pt-1 space-y-3'>
                        {result.args !== undefined && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Call</p>
                            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 whitespace-pre-wrap break-all'>
                              {formatCall(functionName, result.args)}
                            </div>
                          </div>
                        )}
                        {result.expectedReturn !== undefined && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Expected return</p>
                            <div className='bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-900 whitespace-pre-wrap break-all'>
                              {formatReturn(result.expectedReturn)}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className='text-sm text-gray-500 mb-1.5'>Your return</p>
                          <div className='bg-red-50 rounded-lg px-4 py-3 font-mono text-sm text-red-700 whitespace-pre-wrap break-all'>
                            {result.actualOutput || '(no output)'}
                          </div>
                        </div>
                        {result.stderr && (
                          <div>
                            <p className='text-sm text-gray-500 mb-1.5'>Stderr</p>
                            <div className='bg-red-50 rounded-lg px-4 py-3 font-mono text-sm text-red-700 whitespace-pre-wrap break-all'>
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

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

const HistoryContent = ({
  history,
  onRestoreCode,
}: {
  history: SubmissionHistoryItem[];
  onRestoreCode: (code: string) => void;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<SubmissionHistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='flex flex-col items-center gap-2 text-gray-400'>
          <RiHistoryLine className='size-8' />
          <span className='text-sm'>No submissions yet</span>
          <span className='text-xs'>Submit your code to see history</span>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 overflow-y-auto'>
        {history.map((submission, index) => {
          const isExpanded = expandedId === submission.id;
          const score = submission.score ?? 0;
          const maxScore = submission.maxScore ?? 0;
          const isPerfect = score === maxScore && maxScore > 0;

          return (
            <div key={submission.id} className='border-b border-gray-100'>
              <button
                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors'
                onClick={() => setExpandedId(isExpanded ? null : submission.id)}
              >
                <span className='font-mono text-sm text-gray-500 w-6'>
                  #{history.length - index}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPerfect
                      ? 'bg-green-100 text-green-700'
                      : score > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {score}/{maxScore}
                </span>
                <span className='flex-1 text-left text-sm text-gray-500'>
                  {formatRelativeTime(submission.createdAt)}
                </span>
                {isExpanded ? (
                  <RiArrowDownSLine className='size-4 text-gray-400' />
                ) : (
                  <RiArrowRightSLine className='size-4 text-gray-400' />
                )}
              </button>

              {isExpanded && (
                <div className='px-4 pb-4 pt-1'>
                  <Button variant='secondary' onClick={() => setPendingRestore(submission)}>
                    <RiArrowGoBackLine className='size-4 mr-1.5' />
                    Restore this code
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!pendingRestore} onOpenChange={(open) => !open && setPendingRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore this code?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This will overwrite your current code in the editor with the submission from{' '}
            <span className='font-medium text-stone-900'>
              {pendingRestore ? formatDatetime(pendingRestore.createdAt) : ''}
            </span>
            . Your current code will be lost unless you've already submitted it.
          </DialogDescription>
          <DialogFooter>
            <Button variant='secondary' onClick={() => setPendingRestore(null)} icon={RiCloseLine}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingRestore) {
                  onRestoreCode(pendingRestore.code);
                  setPendingRestore(null);
                }
              }}
              icon={RiArrowGoBackLine}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
