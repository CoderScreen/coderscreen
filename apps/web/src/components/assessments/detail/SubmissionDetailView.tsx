import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '@coderscreen/ui/table';
import { MutedText } from '@coderscreen/ui/typography';
import { RiArrowLeftLine, RiCheckboxCircleLine, RiCloseCircleLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { CodeEditor } from '@/components/common/CodeEditor';
import { formatDatetime } from '@/lib/dateUtils';
import { LANGUAGE_LABELS } from '@/lib/languages';
import { useSubmission } from '@/query/assessment.query';

interface TestCaseResultDetail {
  id: string;
  testCaseId: string;
  passed: boolean;
  failureReason: string;
  actualOutput: string;
  stderr: string;
  executionTimeMs: number | null;
  label: string;
  args: unknown[];
  expectedReturn: unknown;
  isHidden: boolean;
  position: number;
}

interface QuestionDetail {
  assessmentQuestionId: string;
  title: string;
  position: number;
  points: number;
  status: 'submitted' | 'draft' | 'not_attempted';
  code: string;
  language: string | null;
  score: number | null;
  maxScore: number | null;
  testCaseResults: TestCaseResultDetail[];
}

interface SubmissionDetailViewProps {
  assessmentId: string;
  subId: string;
}

export const SubmissionDetailView = ({ assessmentId, subId }: SubmissionDetailViewProps) => {
  const { submission, isLoading } = useSubmission(assessmentId, subId);

  const sub = submission as Record<string, unknown> | undefined;
  const candidate = sub?.candidate as Record<string, unknown> | undefined;
  const questions = (sub?.questions as QuestionDetail[] | undefined) ?? [];

  return (
    <div className='py-6'>
      <Link to='/assessments/$assessmentId/submissions' params={{ assessmentId }}>
        <Button variant='ghost' icon={RiArrowLeftLine} className='-ml-1 mb-4'>
          Back to submissions
        </Button>
      </Link>

      {isLoading ? (
        <div className='py-12 text-center text-gray-500'>Loading...</div>
      ) : !submission ? (
        <div className='py-12 text-center text-gray-500'>Submission not found</div>
      ) : (
        <>
          {/* Candidate */}
          <div className='flex items-start justify-between'>
            <div>
              <SmallHeader>{candidate?.name as string}</SmallHeader>
              <MutedText>{candidate?.email as string}</MutedText>
            </div>
            <StatusBadge status={sub?.status as string} />
          </div>

          {/* Summary */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 py-4 mt-4 border-t border-b border-gray-200'>
            <InfoItem
              label='Score'
              value={
                sub?.totalScore != null && sub?.maxScore != null
                  ? `${sub.totalScore}/${sub.maxScore}`
                  : '-'
              }
            />
            <InfoItem
              label='Questions'
              value={`${questions.length} question${questions.length !== 1 ? 's' : ''}`}
            />
            <InfoItem
              label='Started'
              value={sub?.startedAt ? formatDatetime(sub.startedAt as string) : '-'}
            />
            <InfoItem
              label='Submitted'
              value={sub?.submittedAt ? formatDatetime(sub.submittedAt as string) : '-'}
            />
          </div>

          {/* Per-question detail */}
          <div className='mt-6 space-y-8'>
            {questions.length === 0 ? (
              <MutedText>No questions.</MutedText>
            ) : (
              questions.map((q, i) => (
                <QuestionResult key={q.assessmentQuestionId} question={q} index={i} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

const FAILURE_LABELS: Record<string, string> = {
  compile: 'Compile error',
  timeout: 'Timed out',
  crash: 'Runtime error',
  wrong_output: 'Wrong output',
};

const formatValue = (v: unknown): string => {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const formatArgs = (args: unknown[]): string => args.map(formatValue).join(', ');

const QuestionResult = ({ question, index }: { question: QuestionDetail; index: number }) => {
  const { title, status, code, language, score, maxScore, testCaseResults } = question;
  const passed = testCaseResults.filter((r) => r.passed).length;
  const total = testCaseResults.length;

  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-500 font-medium'>{index + 1}.</span>
          <span className='font-medium text-gray-900'>{title}</span>
          <QuestionStatusBadge status={status} />
        </div>
        <div className='flex items-center gap-3 text-sm'>
          {language && (
            <span className='text-gray-500'>
              {LANGUAGE_LABELS[language as keyof typeof LANGUAGE_LABELS] ?? language}
            </span>
          )}
          {score != null && maxScore != null && (
            <span className='font-medium text-gray-900'>
              {score}/{maxScore}
            </span>
          )}
        </div>
      </div>

      {status === 'not_attempted' ? (
        <div className='px-4 py-8 text-center'>
          <MutedText>The candidate did not attempt this question.</MutedText>
        </div>
      ) : (
        <div className='p-4 space-y-4'>
          <div>
            <MutedText className='text-xs mb-1.5 block'>
              {status === 'draft' ? 'Latest code (not submitted)' : 'Submitted code'}
            </MutedText>
            <CodeEditor
              value={code}
              onChange={() => {}}
              language={language ?? undefined}
              readOnly
              className='h-80'
            />
          </div>

          {total > 0 && (
            <div>
              <div className='flex items-center gap-1.5 mb-2'>
                {passed === total ? (
                  <RiCheckboxCircleLine className='size-4 text-green-500' />
                ) : (
                  <RiCloseCircleLine className='size-4 text-red-500' />
                )}
                <MutedText>
                  {passed}/{total} test cases passed
                </MutedText>
              </div>
              <TableRoot>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell className='w-10' />
                      <TableHeaderCell>Test case</TableHeaderCell>
                      <TableHeaderCell>Input</TableHeaderCell>
                      <TableHeaderCell>Expected</TableHeaderCell>
                      <TableHeaderCell>Actual</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testCaseResults.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          {r.passed ? (
                            <RiCheckboxCircleLine className='size-4 text-green-500' />
                          ) : (
                            <RiCloseCircleLine className='size-4 text-red-500' />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className='inline-flex items-center gap-2'>
                            {r.label || `Case ${i + 1}`}
                            {r.isHidden && <Badge variant='neutral'>Hidden</Badge>}
                          </span>
                          {!r.passed && r.failureReason && r.failureReason !== 'passed' && (
                            <div className='text-xs text-red-600 mt-0.5'>
                              {FAILURE_LABELS[r.failureReason] ?? r.failureReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className='font-mono text-xs'>{formatArgs(r.args)}</TableCell>
                        <TableCell className='font-mono text-xs'>
                          {formatValue(r.expectedReturn)}
                        </TableCell>
                        <TableCell className='font-mono text-xs'>
                          {r.actualOutput || '-'}
                          {r.stderr && (
                            <div className='text-xs text-red-600 mt-0.5 whitespace-pre-wrap'>
                              {r.stderr}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableRoot>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant='neutral'>Not Started</Badge>;
    case 'in_progress':
      return <Badge variant='warning'>In Progress</Badge>;
    case 'submitted':
      return <Badge variant='success'>Submitted</Badge>;
    case 'expired':
      return <Badge variant='error'>Expired</Badge>;
    case 'graded':
      return <Badge variant='success'>Graded</Badge>;
    default:
      return <Badge variant='neutral'>{status}</Badge>;
  }
};

const QuestionStatusBadge = ({ status }: { status: QuestionDetail['status'] }) => {
  switch (status) {
    case 'submitted':
      return <Badge variant='success'>Submitted</Badge>;
    case 'draft':
      return <Badge variant='warning'>Draft</Badge>;
    default:
      return <Badge variant='neutral'>Not attempted</Badge>;
  }
};

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <MutedText className='text-xs'>{label}</MutedText>
    <div className='text-sm font-medium text-gray-900 mt-0.5'>{value}</div>
  </div>
);
