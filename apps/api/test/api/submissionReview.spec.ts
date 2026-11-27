import type { Id } from '@coderscreen/common/id';
import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import { addQuestion, createAssessment, createQuestionSubmit, createSubmission } from './factories';
import {
  apiClient,
  captureEmails,
  createOrg,
  db,
  minutesAgo,
  minutesFromNow,
  runCron,
  type TestOrg,
} from './helpers';

/** An org with an assessment and one question, ready for submissions. */
async function setup() {
  const org = await createOrg();
  const assessment = await createAssessment(org);
  const question = await addQuestion(org, assessment.id);
  return { org, assessment, question };
}

const grade = (
  org: TestOrg,
  assessmentId: string,
  subId: string,
  json: Parameters<
    TestOrg['api']['assessments'][':id']['submissions'][':subId']['grade']['$post']
  >[0]['json']
) =>
  org.api.assessments[':id'].submissions[':subId'].grade.$post({
    param: { id: assessmentId, subId },
    json,
  });

const questionScore = (id: Id<'questionSubmission'>) =>
  db()
    .select({ score: questionSubmissionTable.score })
    .from(questionSubmissionTable)
    .where(eq(questionSubmissionTable.id, id))
    .then((r) => r[0].score);

describe('grading a submission', () => {
  it("can't change a question score from another org's attempt", async () => {
    const mine = await setup();
    const theirs = await setup();
    const theirSub = await createSubmission(theirs.org, { assessmentId: theirs.assessment.id });
    const theirSubmit = await createQuestionSubmit(theirs.org, {
      submissionId: theirSub.id,
      questionId: theirs.question.id,
      score: 4,
    });
    const mySub = await createSubmission(mine.org, { assessmentId: mine.assessment.id });

    const res = await grade(mine.org, mine.assessment.id, mySub.id, {
      questionScores: [{ questionSubmissionId: theirSubmit.id, score: 0 }],
    });

    expect(res.status).toBe(404);
    expect(await questionScore(theirSubmit.id)).toBe(4);
  });

  it('rejects a score above the number of tests', async () => {
    const { org, assessment, question } = await setup();
    const sub = await createSubmission(org, { assessmentId: assessment.id });
    const submit = await createQuestionSubmit(org, {
      submissionId: sub.id,
      questionId: question.id,
      score: 2,
    });

    const res = await grade(org, assessment.id, sub.id, {
      questionScores: [{ questionSubmissionId: submit.id, score: 5 }],
    });

    expect(res.status).toBe(400);
  });

  it('lowering a score caps earlier submits so the total follows the override', async () => {
    const { org, assessment, question } = await setup();
    const sub = await createSubmission(org, { assessmentId: assessment.id });
    const earlier = await createQuestionSubmit(org, {
      submissionId: sub.id,
      questionId: question.id,
      score: 3,
      createdAt: minutesAgo(20),
    });
    const best = await createQuestionSubmit(org, {
      submissionId: sub.id,
      questionId: question.id,
      score: 4,
      createdAt: minutesAgo(10),
    });

    const res = await grade(org, assessment.id, sub.id, {
      questionScores: [{ questionSubmissionId: best.id, score: 1 }],
    });

    expect(res.status).toBe(200);
    // 1 of 4 tests on a 100-point question
    expect(await res.json()).toMatchObject({ totalScore: 25, maxScore: 100 });
    expect(await questionScore(best.id)).toBe(1);
    expect(await questionScore(earlier.id)).toBe(1);
  });

  it('records and clears a decision without changing how the attempt ended', async () => {
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'expired',
      submittedAt: null,
    });

    const reviewed = await grade(org, assessment.id, sub.id, {
      decision: 'advance',
      gradingNotes: 'Strong on edge cases',
    });
    expect(await reviewed.json()).toMatchObject({
      decision: 'advance',
      status: 'expired',
      gradingNotes: 'Strong on edge cases',
      reviewedAt: expect.any(String),
    });

    const notesOnly = await grade(org, assessment.id, sub.id, { gradingNotes: 'Edited' });
    expect(await notesOnly.json()).toMatchObject({ decision: 'advance' });

    const cleared = await grade(org, assessment.id, sub.id, { decision: null });
    expect(await cleared.json()).toMatchObject({ decision: null, reviewedAt: null });
  });

  it('blocks a decision while the candidate is still working, but allows notes', async () => {
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      expiresAt: minutesFromNow(30),
    });

    const decided = await grade(org, assessment.id, sub.id, { decision: 'reject' });
    expect(decided.status).toBe(400);

    const noted = await grade(org, assessment.id, sub.id, { gradingNotes: 'Watching this one' });
    expect(noted.status).toBe(200);
  });
});

describe('attempts that run out of time', () => {
  it('expire when the team opens the list, emailing the team once for recent ones', async () => {
    const emails = captureEmails();
    const { org, assessment, question } = await setup();
    const recent = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(70),
      expiresAt: minutesAgo(10),
    });
    const stale = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(60 * 24 * 30),
      expiresAt: minutesAgo(60 * 24 * 30 - 60),
    });
    await createQuestionSubmit(org, { submissionId: recent.id, questionId: question.id, score: 2 });

    const list = async () => {
      const res = await org.api.assessments[':id'].submissions.$get({
        param: { id: assessment.id },
      });
      return res.json();
    };

    const subs = await list();
    expect(subs.find((s) => s.id === recent.id)).toMatchObject({
      status: 'expired',
      totalScore: 50,
    });
    expect(subs.find((s) => s.id === stale.id)?.status).toBe('expired');

    await vi.waitFor(() =>
      expect(emails.filter((e) => e.type === 'assessment_submission')).toHaveLength(1)
    );
    expect(emails.find((e) => e.type === 'assessment_submission')).toMatchObject({
      to: org.email,
      params: { ended_by: 'expired' },
    });
    // They never pressed Submit, so no receipt goes to the candidate.
    expect(emails.some((e) => e.type === 'submission_confirmation')).toBe(false);

    await list();
    expect(emails.filter((e) => e.type === 'assessment_submission')).toHaveLength(1);
  });

  it('expire from the cron even if nobody opens the page', async () => {
    const emails = captureEmails();
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(65),
      expiresAt: minutesAgo(5),
    });

    await runCron();

    const [row] = await db()
      .select({ status: assessmentSubmissionTable.status })
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, sub.id));
    expect(row.status).toBe('expired');
    expect(emails).toContainEqual(
      expect.objectContaining({ type: 'assessment_submission', to: org.email })
    );
  });
});

describe('candidate links', () => {
  it('stop working while archived and come back when unarchived', async () => {
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
    });
    const candidate = apiClient();
    const open = () =>
      candidate.assessments[':subId'].take.$get({
        param: { subId: sub.id },
        query: { token: sub.accessToken },
      });
    const submissionRoute = org.api.assessments[':id'].submissions[':subId'];

    expect((await open()).status).toBe(200);

    await submissionRoute.archive.$post({ param: { id: assessment.id, subId: sub.id } });
    expect((await open()).status).toBe(401);

    await submissionRoute.unarchive.$post({ param: { id: assessment.id, subId: sub.id } });
    expect((await open()).status).toBe(200);
  });
});
