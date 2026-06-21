import type { Parameter, TypeString } from '@coderscreen/common/types';
import { useCallback, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useRunTests, useSubmissionHistory, useSubmitCode } from '@/query/candidateAssessment.query';
import { AssessmentHeader } from './AssessmentHeader';
import { CodeEditorPanel } from './CodeEditorPanel';
import { QuestionPanel } from './QuestionPanel';
import { TestResultsPanel } from './TestResultsPanel';

type TestCaseFailureReason = 'passed' | 'compile' | 'timeout' | 'crash' | 'wrong_output';

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

interface AssessmentCodingViewProps {
  question: {
    id: string;
    title: string;
    description: Record<string, unknown>;
    functionName: string;
    parameters: Parameter[];
    returnType: TypeString;
    testCases?: {
      id: string;
      label?: string;
      args: unknown[];
      expectedReturn: unknown;
    }[];
    [key: string]: unknown;
  };
}

export const AssessmentCodingView = ({ question }: AssessmentCodingViewProps) => {
  const { assessment, getCode, setCode, subId, token } = useTakeAssessment();
  const { runTests, isRunning } = useRunTests(subId, token);
  const { submitCode, isSubmitting } = useSubmitCode(subId, token);
  const { history } = useSubmissionHistory(subId, token, question.id);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);

  const questions = assessment?.questions ?? [];
  const questionIndex = questions.findIndex((q) => q.id === question.id);

  const handleRunTests = useCallback(async () => {
    const code = getCode(question.id);
    const result = await runTests({
      questionId: question.id as `aq_${string}`,
      code,
    });

    const testCases = question.testCases ?? [];
    const results = (result.results ?? []).map((r: any) => {
      const tc = testCases.find((t) => t.id === r.testCaseId);
      return {
        ...r,
        label: tc?.label,
        args: tc?.args,
        expectedReturn: tc?.expectedReturn,
      };
    });

    setTestResults(results);
  }, [question, getCode, runTests]);

  const handleSubmitCode = useCallback(async () => {
    const code = getCode(question.id);
    const result = (await submitCode({
      questionId: question.id as `aq_${string}`,
      code,
    })) as {
      visibleResults?: Array<{
        testCaseId: string;
        actualOutput: string;
        stderr: string;
        passed: boolean;
        failureReason?: TestCaseFailureReason;
        executionTimeMs: number;
      }>;
    };

    // Show visible test results after submission
    const testCases = question.testCases ?? [];
    const results = (result.visibleResults ?? []).map((r) => {
      const tc = testCases.find((t) => t.id === r.testCaseId);
      return {
        ...r,
        label: tc?.label,
        args: tc?.args,
        expectedReturn: tc?.expectedReturn,
      };
    });

    setTestResults(results);
  }, [question, getCode, submitCode]);

  const handleRestoreCode = useCallback(
    (code: string) => {
      setCode(question.id, code);
    },
    [question.id, setCode]
  );

  const testCases = question.testCases ?? [];

  return (
    <div className='h-screen flex flex-col bg-gray-100'>
      <AssessmentHeader mode='coding' />

      <div className='flex-1 min-h-0 p-2'>
        <PanelGroup direction='horizontal'>
          {/* Left: Question */}
          <Panel defaultSize={40} minSize={20}>
            <div className='h-full bg-white rounded-lg overflow-hidden border border-gray-200'>
              <QuestionPanel question={question} questionIndex={questionIndex} />
            </div>
          </Panel>

          <PanelResizeHandle className='w-2 cursor-col-resize' />

          {/* Right: Editor + Test/Results */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction='vertical'>
              {/* Top: Code Editor */}
              <Panel defaultSize={70} minSize={30}>
                <div className='h-full bg-white rounded-lg overflow-hidden border border-gray-200'>
                  <CodeEditorPanel question={question} />
                </div>
              </Panel>

              <PanelResizeHandle className='h-2 cursor-row-resize' />

              {/* Bottom: Test Cases + Results (tabbed) */}
              <Panel defaultSize={30} minSize={15}>
                <div className='h-full bg-white rounded-lg overflow-hidden border border-gray-200'>
                  <TestResultsPanel
                    testCases={testCases}
                    functionName={question.functionName}
                    results={testResults}
                    isRunning={isRunning}
                    onRunTests={handleRunTests}
                    onSubmitCode={handleSubmitCode}
                    isSubmitting={isSubmitting}
                    history={history}
                    onRestoreCode={handleRestoreCode}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};
