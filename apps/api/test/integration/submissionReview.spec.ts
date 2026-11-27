import { assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { candidateTable } from '@coderscreen/db/candidate.db';
import { questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { organization, user } from '@coderscreen/db/user.db';
import { eq } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssessmentSubmissionService } from '@/services/AssessmentSubmission.service';

// Code runs need the Workers sandbox; none of these tests run code.
vi.mock('@/services/AssessmentCodeRun.service', () => ({ AssessmentCodeRunService: class {} }));
vi.mock('@/sandbox/harnesses', () => ({ resolveStarterCode: () => ({}) }));

// Needs a scratch Postgres with the schema pushed (CI does both):
//   docker run --rm -d -p 55471:5432 -e POSTGRES_PASSWORD=test postgres:16
//   cd packages/db && DATABASE_URL=postgres://postgres:test@localhost:55471/postgres \
//     npx drizzle-kit push --force
//   TEST_DATABASE_URL=postgres://postgres:test@localhost:55471/postgres pnpm test
const url = process.env.TEST_DATABASE_URL;

type Sent = { type: string; to: string; params: Record<string, unknown> };

let client: ReturnType<typeof postgres>;
let db: PostgresJsDatabase;
let n = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(n++).toString(36)}`;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** A service wired to a fake request context for the given org. */
const makeService = (orgId: string) => {
  const sent: Sent[] = [];
  const pending: Promise<unknown>[] = [];
  const vars: Record<string, unknown> = {
    db,
    user: { id: 'u_test' },
    session: { activeOrganizationId: orgId },
    appFactory: {
      resendService: {
        sendTransactionalEmail: async (
          type: string,
          to: string,
          params: Record<string, unknown>
        ) => {
          sent.push({ type, to, params });
        },
      },
    },
  };
  const ctx = {
    get: (k: string) => vars[k],
    set: (k: string, v: unknown) => {
      vars[k] = v;
    },
    env: { FE_APP_URL: 'https://app.test' },
    executionCtx: { waitUntil: (p: Promise<unknown>) => pending.push(p) },
  };
  // biome-ignore lint/suspicious/noExplicitAny: minimal stand-in for a Hono context
  const service = new AssessmentSubmissionService(ctx as any);
  return { service, sent, flush: () => Promise.all(pending) };
};

/** An org with a member, one assessment, one question and one candidate. */
const seedOrg = async () => {
  const orgId = uid('org');
  const userId = uid('user');
  await db.insert(organization).values({ id: orgId, name: 'Org', createdAt: new Date() });
  await db.insert(user).values({
    id: userId,
    name: 'Reviewer',
    email: `${userId}@example.com`,
    isOnboarded: true,
  });
  await db.execute(
    `insert into member (id, organization_id, user_id, role, created_at) values ('${uid('mem')}', '${orgId}', '${userId}', 'owner', now())` as never
  );
  const assessmentId = uid('as') as never;
  await db.insert(assessmentTable).values({
    id: assessmentId,
    organizationId: orgId,
    createdByUserId: userId,
    title: 'Backend',
    status: 'active',
    timeLimitSeconds: 3600,
  });
  const libraryId = uid('ql') as never;
  await db.insert(questionLibraryTable).values({
    id: libraryId,
    organizationId: orgId,
    title: 'Two Sum',
    description: {},
  });
  const questionId = uid('aq') as never;
  await db.insert(assessmentQuestionTable).values({
    id: questionId,
    assessmentId,
    organizationId: orgId,
    questionId: libraryId,
    position: 0,
    points: 100,
  } as never);
  const candidateId = uid('cand') as never;
  await db
    .insert(candidateTable)
    .values({ id: candidateId, organizationId: orgId, name: 'Cand', email: 'cand@example.com' });
  return { orgId, assessmentId, questionId, candidateId };
};

const seedSubmission = async (
  org: Awaited<ReturnType<typeof seedOrg>>,
  values: Partial<typeof assessmentSubmissionTable.$inferInsert> = {}
) => {
  const id = uid('asub') as never;
  await db.insert(assessmentSubmissionTable).values({
    id,
    assessmentId: org.assessmentId,
    organizationId: org.orgId,
    candidateId: org.candidateId,
    accessToken: uid('tok'),
    status: 'submitted',
    startedAt: minutesAgo(50),
    submittedAt: minutesAgo(5),
    ...values,
  });
  return id as unknown as Parameters<AssessmentSubmissionService['gradeSubmission']>[0];
};

const seedQuestionSubmit = async (
  org: Awaited<ReturnType<typeof seedOrg>>,
  submissionId: string,
  score: number,
  createdAt = new Date().toISOString()
) => {
  const id = uid('qs') as never;
  await db.insert(questionSubmissionTable).values({
    id,
    submissionId: submissionId as never,
    questionId: org.questionId,
    organizationId: org.orgId,
    score,
    maxScore: 4,
    isDraft: false,
    createdAt,
  } as never);
  return id as unknown as `qs_${string}`;
};

const getSub = (id: string) =>
  db
    .select()
    .from(assessmentSubmissionTable)
    .where(eq(assessmentSubmissionTable.id, id as never))
    .then((r) => r[0]);

const getQs = (id: string) =>
  db
    .select()
    .from(questionSubmissionTable)
    .where(eq(questionSubmissionTable.id, id as never))
    .then((r) => r[0]);

describe.skipIf(!url)('submission review against a scratch database', () => {
  beforeAll(() => {
    client = postgres(url as string, { max: 2 });
    db = drizzle(client);
  });

  afterAll(async () => {
    await client?.end();
  });

  let org: Awaited<ReturnType<typeof seedOrg>>;
  beforeEach(async () => {
    org = await seedOrg();
  });

  it("refuses to change a question score from another org's attempt", async () => {
    const other = await seedOrg();
    const otherSub = await seedSubmission(other);
    const otherQs = await seedQuestionSubmit(other, otherSub, 4);
    const mySub = await seedSubmission(org);

    const { service } = makeService(org.orgId);
    await expect(
      service.gradeSubmission(mySub, {
        questionScores: [{ questionSubmissionId: otherQs, score: 0 }],
      })
    ).rejects.toMatchObject({ status: 404 });

    expect((await getQs(otherQs)).score).toBe(4);
  });

  it('rejects a score above the number of tests', async () => {
    const sub = await seedSubmission(org);
    const qs = await seedQuestionSubmit(org, sub, 2);
    const { service } = makeService(org.orgId);

    await expect(
      service.gradeSubmission(sub, { questionScores: [{ questionSubmissionId: qs, score: 5 }] })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('lowering a score caps earlier submits so the total follows the override', async () => {
    const sub = await seedSubmission(org);
    const earlier = await seedQuestionSubmit(org, sub, 3, minutesAgo(20));
    const best = await seedQuestionSubmit(org, sub, 4, minutesAgo(10));
    const { service } = makeService(org.orgId);

    const updated = await service.gradeSubmission(sub, {
      questionScores: [{ questionSubmissionId: best, score: 1 }],
    });

    expect((await getQs(best)).score).toBe(1);
    expect((await getQs(earlier)).score).toBe(1);
    // 1 of 4 tests on a 100-point question
    expect(updated.totalScore).toBe(25);
    expect(updated.maxScore).toBe(100);
  });

  it('records and clears a decision without changing how the attempt ended', async () => {
    const sub = await seedSubmission(org, { status: 'expired', submittedAt: null });
    const { service } = makeService(org.orgId);

    const reviewed = await service.gradeSubmission(sub, {
      decision: 'advance',
      gradingNotes: 'Strong on edge cases',
    });
    expect(reviewed.decision).toBe('advance');
    expect(reviewed.reviewedAt).not.toBeNull();
    expect(reviewed.status).toBe('expired');
    expect(reviewed.gradingNotes).toBe('Strong on edge cases');

    const notesOnly = await service.gradeSubmission(sub, { gradingNotes: 'Edited' });
    expect(notesOnly.decision).toBe('advance');

    const cleared = await service.gradeSubmission(sub, { decision: null });
    expect(cleared.decision).toBeNull();
    expect(cleared.reviewedAt).toBeNull();
  });

  it('blocks a decision while the candidate is still working', async () => {
    const sub = await seedSubmission(org, {
      status: 'in_progress',
      submittedAt: null,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    });
    const { service } = makeService(org.orgId);

    await expect(service.gradeSubmission(sub, { decision: 'reject' })).rejects.toMatchObject({
      status: 400,
    });
    const withNotes = await service.gradeSubmission(sub, { gradingNotes: 'Watching this one' });
    expect(withNotes.gradingNotes).toBe('Watching this one');
  });

  it('expires overdue attempts on read and emails the team only for recent ones', async () => {
    const recent = await seedSubmission(org, {
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(70),
      expiresAt: minutesAgo(10),
    });
    const stale = await seedSubmission(org, {
      status: 'in_progress',
      submittedAt: null,
      startedAt: minutesAgo(60 * 24 * 30),
      expiresAt: minutesAgo(60 * 24 * 30 - 60),
    });
    await seedQuestionSubmit(org, recent, 2);

    const { service, sent, flush } = makeService(org.orgId);
    const list = await service.listSubmissions(org.assessmentId);
    await flush();

    expect(list.find((s) => s.id === recent)?.status).toBe('expired');
    expect(list.find((s) => s.id === stale)?.status).toBe('expired');
    expect((await getSub(recent)).totalScore).toBe(50);

    const teamEmails = sent.filter((e) => e.type === 'assessment_submission');
    expect(teamEmails).toHaveLength(1);
    expect(teamEmails[0].params.ended_by).toBe('expired');
    // The candidate never pressed Submit, so no receipt goes to them.
    expect(sent.some((e) => e.type === 'submission_confirmation')).toBe(false);

    // A second read finds nothing left to expire and sends nothing new.
    await service.listSubmissions(org.assessmentId);
    await flush();
    expect(sent.filter((e) => e.type === 'assessment_submission')).toHaveLength(1);
  });

  it('archived invite links stop resolving until unarchived', async () => {
    const token = uid('tok');
    const sub = await seedSubmission(org, { accessToken: token, status: 'not_started' });
    const { service } = makeService(org.orgId);

    await service.setSubmissionArchived(sub, true);
    expect(await service.getSubmissionForToken(token)).toBeNull();

    await service.setSubmissionArchived(sub, false);
    expect((await service.getSubmissionForToken(token))?.id).toBe(sub);
  });
});
