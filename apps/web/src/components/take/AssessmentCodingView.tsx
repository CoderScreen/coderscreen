import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useCallback, useState } from 'react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useRunTests } from '@/query/candidateAssessment.query';
import { AssessmentHeader } from './AssessmentHeader';
import { QuestionPanel } from './QuestionPanel';
import { CodeEditorPanel } from './CodeEditorPanel';
import { TestResultsPanel } from './TestResultsPanel';
import { QuestionsOverview } from './QuestionsOverview';

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

export const AssessmentCodingView = () => {
  const { currentQuestion, codeMap, setCurrentQuestionIndex, saveCurrentCode, subId, token } =
    useTakeAssessment();
  const { runTests, isRunning } = useRunTests(subId, token);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'coding'>('overview');

  const handleRunTests = useCallback(async () => {
    if (!currentQuestion) return;

    const code = codeMap[currentQuestion.id] ?? '';
    const result = await runTests({ questionId: currentQuestion.id, code });

    // Map test case metadata onto results
    const testCases = currentQuestion.testCases ?? [];
    const results = (result.results ?? []).map((r: any) => {
      const tc = testCases.find((t) => t.id === r.testCaseId);
      return {
        ...r,
        label: tc?.label,
        input: tc?.input,
        expectedOutput: tc?.expectedOutput,
      };
    });

    setTestResults(results);
  }, [currentQuestion, codeMap, runTests]);

  const handleSelectQuestion = useCallback(
    (index: number) => {
      saveCurrentCode();
      setCurrentQuestionIndex(index);
      setTestResults(null);
      setActiveView('coding');
    },
    [saveCurrentCode, setCurrentQuestionIndex]
  );

  const handleBackToOverview = useCallback(() => {
    saveCurrentCode();
    setActiveView('overview');
  }, [saveCurrentCode]);

  if (activeView === 'overview') {
    return (
      <div className='h-screen flex flex-col bg-white'>
        <AssessmentHeader mode='overview' />
        <QuestionsOverview onSelectQuestion={handleSelectQuestion} />
      </div>
    );
  }

  const testCases = currentQuestion?.testCases ?? [];

  return (
    <div className='h-screen flex flex-col bg-white'>
      <AssessmentHeader mode='coding' onBackToOverview={handleBackToOverview} />

      <div className='flex-1 min-h-0'>
        <PanelGroup direction='horizontal'>
          {/* Left: Question */}
          <Panel defaultSize={40} minSize={20}>
            <div className='h-full border-r border-gray-200'>
              <QuestionPanel />
            </div>
          </Panel>

          <PanelResizeHandle className='w-2 flex items-center justify-center group cursor-col-resize'>
            <div className='w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-gray-400 group-active:bg-gray-500 transition-colors' />
          </PanelResizeHandle>

          {/* Right: Editor + Test/Results */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction='vertical'>
              {/* Top: Code Editor */}
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel />
              </Panel>

              <PanelResizeHandle className='h-2 flex items-center justify-center group cursor-row-resize'>
                <div className='h-0.5 w-8 rounded-full bg-gray-300 group-hover:bg-gray-400 group-active:bg-gray-500 transition-colors' />
              </PanelResizeHandle>

              {/* Bottom: Test Cases + Results (tabbed) */}
              <Panel defaultSize={30} minSize={15}>
                <div className='h-full border-t border-gray-200'>
                  <TestResultsPanel
                    testCases={testCases}
                    results={testResults}
                    isRunning={isRunning}
                    onRunTests={handleRunTests}
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
