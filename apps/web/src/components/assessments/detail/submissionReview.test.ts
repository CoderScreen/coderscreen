import { describe, expect, it } from 'vitest';
import {
  getFinishedAt,
  getReviewState,
  getTimeTaken,
  matchesFilter,
  type ReviewableSubmission,
  sortSubmissions,
} from './submissionReview';

const sub = (overrides: Partial<ReviewableSubmission>): ReviewableSubmission => ({
  id: 'asub_1',
  status: 'submitted',
  decision: null,
  createdAt: '2026-11-20 10:00:00+00',
  startedAt: '2026-11-20 10:00:00+00',
  submittedAt: '2026-11-20 10:42:00+00',
  expiresAt: '2026-11-20 11:00:00+00',
  totalScore: 50,
  maxScore: 100,
  ...overrides,
});

describe('getReviewState', () => {
  it('maps each attempt to what the reviewer has to do next', () => {
    expect(getReviewState(sub({ status: 'not_started' }))).toBe('invited');
    expect(getReviewState(sub({ status: 'not_started', startBy: '2026-01-01 00:00:00+00' }))).toBe(
      'invite_expired'
    );
    expect(getReviewState(sub({ status: 'not_started', startBy: '2999-01-01 00:00:00+00' }))).toBe(
      'invited'
    );
    expect(getReviewState(sub({ status: 'in_progress' }))).toBe('in_progress');
    expect(getReviewState(sub({ status: 'submitted' }))).toBe('needs_review');
    expect(getReviewState(sub({ status: 'expired' }))).toBe('needs_review');
    expect(getReviewState(sub({ decision: 'advance' }))).toBe('advanced');
    expect(getReviewState(sub({ status: 'expired', decision: 'reject' }))).toBe('rejected');
    expect(getReviewState(sub({ status: 'graded' }))).toBe('reviewed');
  });

  it('groups every decided attempt under the Reviewed filter', () => {
    expect(matchesFilter(sub({ decision: 'reject' }), 'reviewed')).toBe(true);
    expect(matchesFilter(sub({ status: 'graded' }), 'reviewed')).toBe(true);
    expect(matchesFilter(sub({}), 'reviewed')).toBe(false);
    expect(matchesFilter(sub({}), 'needs_review')).toBe(true);
    expect(
      matchesFilter(sub({ status: 'not_started', startBy: '2026-01-01 00:00:00+00' }), 'invited')
    ).toBe(true);
  });
});

describe('time taken', () => {
  it('measures to the submit time', () => {
    expect(getTimeTaken(sub({}))).toBe('42 min');
  });

  it('measures to the deadline when time ran out', () => {
    const expired = sub({ status: 'expired', submittedAt: null });
    expect(getFinishedAt(expired)).toBe(expired.expiresAt);
    expect(getTimeTaken(expired)).toBe('1h');
  });

  it('is empty while the candidate is still working', () => {
    expect(getTimeTaken(sub({ status: 'in_progress', submittedAt: null }))).toBeNull();
  });
});

describe('sortSubmissions', () => {
  const a = sub({ id: 'a', submittedAt: '2026-11-20 10:30:00+00', totalScore: 90 });
  const b = sub({ id: 'b', submittedAt: '2026-11-21 09:00:00+00', totalScore: 40 });
  const c = sub({
    id: 'c',
    status: 'not_started',
    startedAt: null,
    submittedAt: null,
    createdAt: '2026-11-22 08:00:00+00',
    totalScore: null,
    maxScore: null,
  });

  it('puts the latest activity first', () => {
    expect(sortSubmissions([a, b, c], 'recent').map((s) => s.id)).toEqual(['c', 'b', 'a']);
  });

  it('ranks by score with unscored attempts last', () => {
    expect(sortSubmissions([c, b, a], 'score').map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });
});
