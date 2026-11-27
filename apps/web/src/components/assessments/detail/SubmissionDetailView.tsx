import type { Id } from '@coderscreen/common/id';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '@coderscreen/ui/table';
import { Textarea } from '@coderscreen/ui/textarea';
import { Tooltip } from '@coderscreen/ui/tooltip';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiThumbDownLine,
  RiThumbUpLine,
} from '@remixicon/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { CodeEditor } from '@/components/common/CodeEditor';
import { formatDatetime } from '@/lib/dateUtils';
import { LANGUAGE_LABELS } from '@/lib/languages';
import { useGradeSubmission, useSubmission, useSubmissions } from '@/query/assessment.query';
import {
  attemptEnded,
  getFinishedAt,
  getTimeTaken,
  matchesFilter,
  type ReviewableSubmission,
  ReviewStateBadge,
  type SubmissionFilter,
  type SubmissionSort,
  sortSubmissions,
} from './submissionReview';

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
  questionSubmissionId: string | null;
  title: string;
  position: number;
  points: number;
  isArchived: boolean;
  status: 'submitted' | 'draft' | 'not_attempted';
  code: string;
  language: string | null;
  score: number | null;
  maxScore: number | null;
  testCaseResults: TestCaseResultDetail[];
}

type SubmissionDetail = ReviewableSubmission & {
  gradingNotes: string;
  reviewedAt: string | null;
  candidate: { name: string; email: string } | null;
  questions: QuestionDetail[];
};

interface SubmissionDetailViewProps {
  assessmentId: string;
  subId: string;
  filter: SubmissionFilter;
  sort: SubmissionSort;
}

export const SubmissionDetailView = ({
  assessmentId,
  subId,
  filter,
  sort,
}: SubmissionDetailViewProps) => {
  const { submission, isLoading } = useSubmission(assessmentId, subId);
  const sub = submission as unknown as SubmissionDetail | undefined;
  const questions = sub?.questions ?? [];
  const finishedAt = sub ? getFinishedAt(sub) : null;

  return (
    <div className='py-6'>
      <div className='flex items-center justify-between mb-4'>
        <Link
          to='/assessments/$assessmentId/submissions'
          params={{ assessmentId }}
          search={{ filter, sort }}
        >
          <Button variant='ghost' icon={RiArrowLeftLine} className='-ml-1'>
            Back to submissions
          </Button>
        </Link>
        <SubmissionPager assessmentId={assessmentId} subId={subId} filter={filter} sort={sort} />
      </div>

      {isLoading ? (
        <div className='py-12 text-center text-gray-500'>Loading...</div>
      ) : !sub ? (
        <div className='py-12 text-center text-gray-500'>Submission not found</div>
      ) : (
        <>
          {/* Candidate */}
          <div className='flex items-start justify-between'>
            <div>
              <SmallHeader>{sub.candidate?.name}</SmallHeader>
              <MutedText>{sub.candidate?.email}</MutedText>
            </div>
            <ReviewStateBadge sub={sub} />
          </div>

          {/* Summary */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 py-4 mt-4 border-t border-b border-gray-200'>
            <InfoItem
              label='Score'
              value={
                sub.totalScore != null && sub.maxScore != null
                  ? `${sub.totalScore}/${sub.maxScore}`
                  : '-'
              }
            />
            <InfoItem label='Time taken' value={getTimeTaken(sub) ?? '-'} />
            <InfoItem label='Started' value={sub.startedAt ? formatDatetime(sub.startedAt) : '-'} />
            <InfoItem
              label={sub.status === 'expired' ? 'Time ran out' : 'Submitted'}
              value={finishedAt ? formatDatetime(finishedAt) : '-'}
            />
          </div>

          <ReviewPanel key={sub.id} assessmentId={assessmentId} sub={sub} />

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

const SubmissionPager = ({
  assessmentId,
  subId,
  filter,
  sort,
}: {
  assessmentId: string;
  subId: string;
  filter: SubmissionFilter;
  sort: SubmissionSort;
}) => {
  const { submissions } = useSubmissions(assessmentId);
  const navigate = useNavigate();

  const ordered = useMemo(() => {
    const all = (submissions ?? []) as unknown as ReviewableSubmission[];
    const current = all.find((s) => s.id === subId);
    // Archived rows only join the walk when you're already looking at one.
    const pool = all.filter((s) => !s.isArchived || current?.isArchived);
    return sortSubmissions(
      pool.filter((s) => s.id === subId || matchesFilter(s, filter)),
      sort
    );
  }, [submissions, subId, filter, sort]);

  const index = ordered.findIndex((s) => s.id === subId);
  if (index === -1 || ordered.length < 2) return null;

  const go = (target: ReviewableSubmission | undefined) => {
    if (!target) return;
    navigate({
      to: '/assessments/$assessmentId/submissions/$subId',
      params: { assessmentId, subId: target.id },
      search: { filter, sort },
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <MutedText className='text-sm'>
        {index + 1} of {ordered.length}
      </MutedText>
      <Button
        variant='secondary'
        icon={RiArrowLeftSLine}
        disabled={index === 0}
        onClick={() => go(ordered[index - 1])}
      >
        Previous
      </Button>
      <Button
        variant='secondary'
        icon={RiArrowRightSLine}
        iconPosition='right'
        disabled={index === ordered.length - 1}
        onClick={() => go(ordered[index + 1])}
      >
        Next
      </Button>
    </div>
  );
};

const ReviewPanel = ({ assessmentId, sub }: { assessmentId: string; sub: SubmissionDetail }) => {
  const { gradeSubmission, isLoading } = useGradeSubmission(assessmentId);
  const ended = attemptEnded(sub);
  const scorable = useMemo(
    () => sub.questions.filter((q) => q.questionSubmissionId && q.maxScore != null),
    [sub.questions]
  );

  const [notes, setNotes] = useState(sub.gradingNotes ?? '');
  const [decision, setDecision] = useState<'advance' | 'reject' | null>(
    (sub.decision as 'advance' | 'reject' | null) ?? null
  );
  const initialScores = useMemo(
    () => Object.fromEntries(scorable.map((q) => [q.questionSubmissionId, String(q.score ?? 0)])),
    [scorable]
  );
  const [scores, setScores] = useState<Record<string, string>>(initialScores);

  // Saving refetches the submission; keep the form in step with what's stored.
  useEffect(() => {
    setNotes(sub.gradingNotes ?? '');
    setDecision((sub.decision as 'advance' | 'reject' | null) ?? null);
  }, [sub.gradingNotes, sub.decision]);
  useEffect(() => setScores(initialScores), [initialScores]);

  const changedScores = scorable
    .filter((q) => scores[q.questionSubmissionId as string] !== String(q.score ?? 0))
    .map((q) => ({
      questionSubmissionId: q.questionSubmissionId as string,
      score: Number(scores[q.questionSubmissionId as string]),
      maxScore: q.maxScore as number,
    }));
  const scoreError = changedScores.find(
    (s) => !Number.isInteger(s.score) || s.score < 0 || s.score > s.maxScore
  );
  const dirty =
    notes !== (sub.gradingNotes ?? '') ||
    decision !== ((sub.decision as string | null) ?? null) ||
    changedScores.length > 0;

  const save = async () => {
    await gradeSubmission({
      subId: sub.id,
      data: {
        gradingNotes: notes,
        ...(ended ? { decision } : {}),
        ...(changedScores.length
          ? {
              questionScores: changedScores.map(({ questionSubmissionId, score }) => ({
                questionSubmissionId: questionSubmissionId as Id<'questionSubmission'>,
                score,
              })),
            }
          : {}),
      },
    }).catch(() => {});
  };

  const toggle = (value: 'advance' | 'reject') => setDecision((d) => (d === value ? null : value));

  return (
    <div className='mt-6 border border-gray-200 rounded-lg p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='font-medium text-gray-900'>Review</div>
        {sub.reviewedAt && (
          <MutedText className='text-xs'>Reviewed {formatDatetime(sub.reviewedAt)}</MutedText>
        )}
      </div>

      {ended ? (
        <div className='flex items-center gap-2'>
          <Button
            variant={decision === 'advance' ? 'primary' : 'secondary'}
            icon={RiThumbUpLine}
            onClick={() => toggle('advance')}
          >
            Advance
          </Button>
          <Button
            variant={decision === 'reject' ? 'destructive' : 'secondary'}
            icon={RiThumbDownLine}
            onClick={() => toggle('reject')}
          >
            Reject
          </Button>
        </div>
      ) : (
        <MutedText className='text-sm'>
          You can record a decision once the candidate submits or runs out of time.
        </MutedText>
      )}

      <div>
        <MutedText className='text-xs mb-1.5 block'>Notes (only your team sees these)</MutedText>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='What stood out? Anything to follow up on in the next round?'
          rows={4}
        />
      </div>

      {ended && scorable.length > 0 && (
        <div>
          <MutedText className='text-xs mb-1.5 block'>
            Adjust test scores (for example, to give credit a test case missed)
          </MutedText>
          <div className='space-y-2'>
            {scorable.map((q) => {
              const id = q.questionSubmissionId as string;
              return (
                <div key={id} className='flex items-center gap-3'>
                  <span className='text-sm text-gray-900 flex-1 truncate'>{q.title}</span>
                  <Input
                    type='number'
                    min={0}
                    max={q.maxScore ?? undefined}
                    value={scores[id] ?? ''}
                    onChange={(e) => setScores((prev) => ({ ...prev, [id]: e.target.value }))}
                    className='w-20'
                  />
                  <MutedText className='text-sm w-24'>of {q.maxScore} tests</MutedText>
                </div>
              );
            })}
          </div>
          {scoreError && (
            <div className='text-xs text-red-600 mt-1.5'>
              Scores must be whole numbers from 0 to {scoreError.maxScore}.
            </div>
          )}
        </div>
      )}

      <div className='flex justify-end'>
        <Button onClick={save} disabled={!dirty || !!scoreError} isLoading={isLoading}>
          Save review
        </Button>
      </div>
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
  const { title, status, code, language, score, maxScore, testCaseResults, isArchived } = question;
  const passed = testCaseResults.filter((r) => r.passed).length;
  const total = testCaseResults.length;

  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-500 font-medium'>{index + 1}.</span>
          <span className='font-medium text-gray-900'>{title}</span>
          <QuestionStatusBadge status={status} />
          {isArchived && (
            <Tooltip content='Removed from the assessment after this candidate took it. Shown for reference.'>
              <Badge variant='neutral'>Removed</Badge>
            </Tooltip>
          )}
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
              className='[&_.cm-editor]:h-auto'
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
