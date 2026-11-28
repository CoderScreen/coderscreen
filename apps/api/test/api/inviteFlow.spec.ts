import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import { addQuestion, createAssessment, createCandidate, createSubmission } from './factories';
import {
  apiClient,
  captureEmails,
  createOrg,
  db,
  minutesAgo,
  minutesFromNow,
  type TestOrg,
} from './helpers';

async function setup() {
  const org = await createOrg();
  const assessment = await createAssessment(org);
  await addQuestion(org, assessment.id);
  return { org, assessment };
}

const submissionRow = (id: string) =>
  db()
    .select()
    .from(assessmentSubmissionTable)
    .where(eq(assessmentSubmissionTable.id, id as never))
    .then((r) => r[0]);

const route = (org: TestOrg) => org.api.assessments[':id'].submissions;

/** The candidate's side of their link. */
const asCandidate = (sub: { id: string; accessToken: string }) => {
  const take = apiClient().assessments[':subId'].take;
  const args = { param: { subId: sub.id }, query: { token: sub.accessToken } };
  return {
    start: () => take.start.$post({ ...args, json: { selectedLanguage: 'python' } }),
    submit: () => take.submit.$post(args),
  };
};

describe('bulk invites', () => {
  it('invites pasted emails and existing candidates, with a deadline and message', async () => {
    const emails = captureEmails();
    const { org, assessment } = await setup();
    const existing = await createCandidate(org, { name: 'Cy Liu' });

    const res = await route(org).bulk.$post({
      param: { id: assessment.id },
      json: {
        candidates: [
          { name: 'Ada Park', email: 'ada@example.com' },
          { email: 'ben.ortiz@example.com' },
          { email: 'BEN.ORTIZ@example.com' },
          { candidateId: existing.id },
        ],
        startByDays: 7,
        message: 'Looking forward to it! <b>No rush.</b>',
      },
    });
    const { results } = await res.json();

    expect(results.map((r) => [r.status, r.name])).toEqual([
      ['invited', 'Ada Park'],
      ['invited', 'Ben Ortiz'],
      ['invited', 'Cy Liu'],
    ]);

    const ada = results[0];
    if (ada.status === 'failed') throw new Error('expected Ada to be invited');
    const row = await submissionRow(ada.submissionId);
    expect(row.inviteMessage).toBe('Looking forward to it! <b>No rush.</b>');
    const days = (new Date(row.startBy as string).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);

    const invites = emails.filter((e) => e.type === 'assessment_invitation');
    expect(invites.map((e) => e.to).sort()).toEqual(
      ['ada@example.com', 'ben.ortiz@example.com', existing.email].sort()
    );
    expect(invites[0].params).toMatchObject({
      message: 'Looking forward to it! <b>No rush.</b>',
      start_by: expect.any(String),
    });
  });

  it('returns an open invite instead of sending a second one', async () => {
    const emails = captureEmails();
    const { org, assessment } = await setup();
    const json = { candidates: [{ name: 'Ada', email: 'ada@example.com' }] };

    await route(org).bulk.$post({ param: { id: assessment.id }, json });
    const again = await route(org).bulk.$post({ param: { id: assessment.id }, json });

    expect((await again.json()).results[0].status).toBe('already_invited');
    expect(emails.filter((e) => e.type === 'assessment_invitation')).toHaveLength(1);
  });

  it('reports each failure without losing the rest', async () => {
    const { org, assessment } = await setup();
    const other = await createOrg();
    const theirs = await createCandidate(other);

    const res = await route(org).bulk.$post({
      param: { id: assessment.id },
      json: { candidates: [{ candidateId: theirs.id }, { email: 'ok@example.com' }] },
    });
    const { results } = await res.json();

    expect(results.map((r) => r.status)).toEqual(['failed', 'invited']);
    expect(results[0]).toMatchObject({ error: 'Candidate not found' });
  });
});

describe('resending an invite', () => {
  it('emails the same link again', async () => {
    const emails = captureEmails();
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
      inviteMessage: 'Hi again',
    });

    const res = await route(org)[':subId'].resend.$post({
      param: { id: assessment.id, subId: sub.id },
    });

    expect(await res.json()).toEqual({ emailSent: true });
    expect(emails).toContainEqual(
      expect.objectContaining({
        type: 'assessment_invitation',
        params: expect.objectContaining({
          message: 'Hi again',
          take_link: expect.stringContaining(sub.accessToken),
        }),
      })
    );
  });

  it("refuses once the candidate has started, or the invite's deadline passed", async () => {
    const { org, assessment } = await setup();
    const started = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
    });
    const lapsed = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
      startBy: minutesAgo(5),
    });

    for (const sub of [started, lapsed]) {
      const res = await route(org)[':subId'].resend.$post({
        param: { id: assessment.id, subId: sub.id },
      });
      expect(res.status).toBe(400);
    }
  });
});

describe('giving more time', () => {
  const extend = (org: TestOrg, assessmentId: string, subId: string, minutes: number) =>
    route(org)[':subId'].extend.$post({ param: { id: assessmentId, subId }, json: { minutes } });

  it('moves the finish time for an attempt in progress', async () => {
    const { org, assessment } = await setup();
    const expiresAt = minutesFromNow(10);
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      expiresAt,
    });

    await extend(org, assessment.id, sub.id, 30);

    const row = await submissionRow(sub.id);
    const added =
      (new Date(row.expiresAt as string).getTime() - new Date(expiresAt).getTime()) / 60_000;
    expect(Math.round(added)).toBe(30);
  });

  it("moves the start deadline for an invite that hasn't been started, counting from now if it passed", async () => {
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
      startBy: minutesAgo(60),
    });

    await extend(org, assessment.id, sub.id, 60 * 24);

    const row = await submissionRow(sub.id);
    const hoursLeft = (new Date(row.startBy as string).getTime() - Date.now()) / 3_600_000;
    expect(Math.round(hoursLeft)).toBe(24);
  });

  it('refuses when there is nothing to extend', async () => {
    const { org, assessment } = await setup();
    const noLimit = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      expiresAt: null,
    });
    const ended = await createSubmission(org, { assessmentId: assessment.id });

    for (const sub of [noLimit, ended]) {
      expect((await extend(org, assessment.id, sub.id, 30)).status).toBe(400);
    }
  });
});

describe('starting an assessment', () => {
  it("can't start after the invite's deadline", async () => {
    const { org, assessment } = await setup();
    const sub = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
      startBy: minutesAgo(1),
    });

    const res = await asCandidate(sub).start();

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ message: 'This invite has expired' });
  });

  it('closing an assessment stops new invites and starts, but lets started attempts finish', async () => {
    const { org, assessment } = await setup();
    const notStarted = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'not_started',
      startedAt: null,
      submittedAt: null,
    });
    const working = await createSubmission(org, {
      assessmentId: assessment.id,
      status: 'in_progress',
      submittedAt: null,
      expiresAt: minutesFromNow(30),
    });

    await org.api.assessments[':id'].archive.$post({ param: { id: assessment.id } });

    const invite = await route(org).bulk.$post({
      param: { id: assessment.id },
      json: { candidates: [{ email: 'late@example.com' }] },
    });
    expect((await invite.json()).results[0].status).toBe('failed');
    expect((await asCandidate(notStarted).start()).status).toBe(400);
    const resend = await route(org)[':subId'].resend.$post({
      param: { id: assessment.id, subId: notStarted.id },
    });
    expect(resend.status).toBe(400);
    expect((await asCandidate(working).submit()).status).toBe(200);
    await vi.waitFor(async () =>
      expect((await submissionRow(working.id)).status).toBe('submitted')
    );
  });
});
