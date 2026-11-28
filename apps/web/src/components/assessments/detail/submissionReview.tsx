import { Badge } from '@coderscreen/ui/badge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { z } from 'zod';

dayjs.extend(utc);

// Same parsing as lib/dateUtils: API timestamps are Postgres strings in UTC.
const parse = (date: string) => dayjs.utc(date);

export interface ReviewableSubmission {
  id: string;
  status: string;
  decision?: string | null;
  createdAt: string;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  startBy?: string | null;
  totalScore: number | null;
  maxScore: number | null;
  isArchived?: boolean;
}

export type ReviewState =
  | 'invited'
  | 'invite_expired'
  | 'in_progress'
  | 'needs_review'
  | 'advanced'
  | 'rejected'
  | 'reviewed';

export const getReviewState = (sub: ReviewableSubmission): ReviewState => {
  if (sub.status === 'not_started') {
    return sub.startBy && parse(sub.startBy).isBefore(dayjs()) ? 'invite_expired' : 'invited';
  }
  if (sub.status === 'in_progress') return 'in_progress';
  if (sub.decision === 'advance') return 'advanced';
  if (sub.decision === 'reject') return 'rejected';
  // Older reviews only set status 'graded', with no decision.
  if (sub.status === 'graded') return 'reviewed';
  return 'needs_review';
};

export const isReviewed = (state: ReviewState) =>
  state === 'advanced' || state === 'rejected' || state === 'reviewed';

export const attemptEnded = (sub: ReviewableSubmission) =>
  sub.status === 'submitted' || sub.status === 'expired' || sub.status === 'graded';

/** When the attempt ended: the submit time, or the deadline if time ran out. */
export const getFinishedAt = (sub: ReviewableSubmission): string | null => {
  if (sub.submittedAt) return sub.submittedAt;
  if (sub.status === 'expired') return sub.expiresAt;
  return null;
};

const formatMinutes = (minutes: number) => {
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const getTimeTaken = (sub: ReviewableSubmission): string | null => {
  const finishedAt = getFinishedAt(sub);
  if (!sub.startedAt || !finishedAt) return null;
  return formatMinutes(parse(finishedAt).diff(parse(sub.startedAt), 'minute'));
};

export const getTimeLeft = (sub: ReviewableSubmission): string | null => {
  if (sub.status !== 'in_progress' || !sub.expiresAt) return null;
  const minutes = parse(sub.expiresAt).diff(dayjs(), 'minute');
  return minutes > 0 ? `${formatMinutes(minutes)} left` : null;
};

/** Most recent thing that happened to the attempt, for "newest first". */
export const getLastActivity = (sub: ReviewableSubmission) =>
  getFinishedAt(sub) ?? sub.startedAt ?? sub.createdAt;

export const SUBMISSION_FILTERS = [
  'all',
  'needs_review',
  'in_progress',
  'invited',
  'reviewed',
] as const;
export type SubmissionFilter = (typeof SUBMISSION_FILTERS)[number];
export type SubmissionSort = 'recent' | 'score';

// Shared by the list and detail routes so next/previous walks the list as filtered.
export const submissionListSearchSchema = z.object({
  filter: z.enum(SUBMISSION_FILTERS).optional(),
  sort: z.enum(['recent', 'score']).optional(),
});

export const matchesFilter = (sub: ReviewableSubmission, filter: SubmissionFilter) => {
  if (filter === 'all') return true;
  const state = getReviewState(sub);
  if (filter === 'reviewed') return isReviewed(state);
  if (filter === 'invited') return state === 'invited' || state === 'invite_expired';
  return state === filter;
};

export const sortSubmissions = <T extends ReviewableSubmission>(subs: T[], sort: SubmissionSort) =>
  [...subs].sort((a, b) => {
    if (sort === 'score') {
      const ratio = (s: T) => (s.totalScore != null && s.maxScore ? s.totalScore / s.maxScore : -1);
      const diff = ratio(b) - ratio(a);
      if (diff !== 0) return diff;
    }
    return parse(getLastActivity(b)).valueOf() - parse(getLastActivity(a)).valueOf();
  });

export const ReviewStateBadge = ({ sub }: { sub: ReviewableSubmission }) => {
  const state = getReviewState(sub);
  switch (state) {
    case 'invited':
      return <Badge variant='neutral'>Invited</Badge>;
    case 'invite_expired':
      return <Badge variant='neutral'>Invite expired</Badge>;
    case 'in_progress':
      return <Badge variant='warning'>In progress</Badge>;
    case 'needs_review':
      return <Badge variant='default'>Needs review</Badge>;
    case 'advanced':
      return <Badge variant='success'>Advanced</Badge>;
    case 'rejected':
      return <Badge variant='error'>Rejected</Badge>;
    case 'reviewed':
      return <Badge variant='neutral'>Reviewed</Badge>;
  }
};
