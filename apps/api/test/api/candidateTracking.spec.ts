import { describe, expect, it } from 'vitest';
import { createAssessment, createCandidate, createSubmission } from './factories';
import { createOrg, minutesAgo, minutesFromNow } from './helpers';

describe('assessment list counts', () => {
  it('counts candidates in each review state, leaving out archived ones', async () => {
    const org = await createOrg();
    const assessment = await createAssessment(org);
    const other = await createAssessment(org, { title: 'Frontend Screen' });
    const base = { assessmentId: assessment.id };

    await createSubmission(org, {
      ...base,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
    });
    await createSubmission(org, {
      ...base,
      status: 'in_progress',
      submittedAt: null,
      expiresAt: minutesFromNow(30),
    });
    await createSubmission(org, base);
    await createSubmission(org, { ...base, status: 'expired', submittedAt: null });
    await createSubmission(org, { ...base, decision: 'advance', reviewedAt: minutesAgo(1) });
    await createSubmission(org, { ...base, status: 'graded' });
    await createSubmission(org, { ...base, isArchived: true });
    // Walked away and ran out of time: counts as needing review, not in progress.
    await createSubmission(org, {
      ...base,
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(90),
      expiresAt: minutesAgo(30),
    });

    const res = await org.api.assessments.$get({ query: {} });
    const { data } = await res.json();

    expect(data.find((a) => a.id === assessment.id)?.submissionCounts).toEqual({
      invited: 1,
      inProgress: 1,
      needsReview: 3,
      reviewed: 2,
    });
    expect(data.find((a) => a.id === other.id)?.submissionCounts).toEqual({
      invited: 0,
      inProgress: 0,
      needsReview: 0,
      reviewed: 0,
    });
  });
});

describe('candidates', () => {
  it('list shows how many assessments each candidate has and their latest one', async () => {
    const org = await createOrg();
    const backend = await createAssessment(org, { title: 'Backend Screen' });
    const frontend = await createAssessment(org, { title: 'Frontend Screen' });
    const ada = await createCandidate(org, { name: 'Ada' });
    const ben = await createCandidate(org, { name: 'Ben' });

    await createSubmission(org, {
      assessmentId: backend.id,
      candidateId: ada.id,
      createdAt: minutesAgo(60),
    });
    await createSubmission(org, {
      assessmentId: frontend.id,
      candidateId: ada.id,
      createdAt: minutesAgo(5),
      decision: 'reject',
    });

    const res = await org.api.candidates.$get();
    const candidates = await res.json();

    expect(candidates.find((c) => c.id === ada.id)).toMatchObject({
      assessmentCount: 2,
      latestSubmission: { assessmentTitle: 'Frontend Screen', decision: 'reject' },
    });
    expect(candidates.find((c) => c.id === ben.id)).toMatchObject({
      assessmentCount: 0,
      latestSubmission: null,
    });
  });

  it("detail lists every assessment the candidate took, with each one's title", async () => {
    const org = await createOrg();
    const backend = await createAssessment(org, { title: 'Backend Screen' });
    const ada = await createCandidate(org);
    const sub = await createSubmission(org, { assessmentId: backend.id, candidateId: ada.id });

    const res = await org.api.candidates[':id'].$get({ param: { id: ada.id } });
    expect(res.status).toBe(200);
    const detail = await res.json();

    expect('submissions' in detail && detail.submissions).toEqual([
      expect.objectContaining({ id: sub.id, assessmentTitle: 'Backend Screen' }),
    ]);
  });

  it("can't be read from another org", async () => {
    const org = await createOrg();
    const other = await createOrg();
    const theirs = await createCandidate(other);

    const res = await org.api.candidates[':id'].$get({ param: { id: theirs.id } });

    expect(res.status).toBe(404);
  });
});
