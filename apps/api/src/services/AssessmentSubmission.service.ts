import { generateId, Id } from '@coderscreen/common/id';
import { AssessmentLanguage, assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import {
  AssessmentSubmissionEntity,
  assessmentSubmissionTable,
} from '@coderscreen/db/assessmentSubmission.db';
import { CandidateEntity, candidateTable } from '@coderscreen/db/candidate.db';
import { questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import { questionLibraryTestCaseTable } from '@coderscreen/db/questionLibraryTestCase.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { TestCaseResultEntity, testCaseResultTable } from '@coderscreen/db/testCaseResult.db';
import { member, organization, user } from '@coderscreen/db/user.db';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  lt,
  ne,
  SQL,
  sql,
} from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { reportError } from '@/lib/report';
import { getSession } from '@/lib/session';
import { resolveStarterCode } from '@/sandbox/harnesses';
import {
  BulkInviteSchema,
  ChangeLanguageSchema,
  CreateSubmissionSchema,
  GradeSubmissionSchema,
  SaveCodeSchema,
  StartAssessmentSchema,
} from '@/schema/assessment.zod';
import { AssessmentCodeRunService } from '@/services/AssessmentCodeRun.service';
import { UsageService } from '@/services/billing/Usage.service';

const EXPIRY_NOTIFY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** "ada.park@acme.com" -> "Ada Park", for invites pasted as bare emails. */
const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || email;

export class AssessmentSubmissionService {
  private readonly db: PostgresJsDatabase;
  private readonly usageService: UsageService;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
    this.usageService = new UsageService(ctx);
  }

  // === Candidate CRUD ===

  async createCandidate(params: { name: string; email: string }) {
    const { orgId } = getSession(this.ctx);

    // Upsert: find existing or create
    const existing = await this.db
      .select()
      .from(candidateTable)
      .where(and(eq(candidateTable.organizationId, orgId), eq(candidateTable.email, params.email)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (existing) {
      // Update name if it changed
      if (existing.name !== params.name) {
        return this.db
          .update(candidateTable)
          .set({ name: params.name, updatedAt: new Date().toISOString() })
          .where(eq(candidateTable.id, existing.id))
          .returning()
          .then((r) => r[0]);
      }
      return existing;
    }

    return this.db
      .insert(candidateTable)
      .values({
        id: generateId('candidate'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        name: params.name,
        email: params.email,
      })
      .returning()
      .then((r) => r[0]);
  }

  async getCandidate(id: Id<'candidate'>) {
    const { orgId } = getSession(this.ctx);
    await this.expireOverdueInOrg(orgId);

    const candidate = await this.db
      .select()
      .from(candidateTable)
      .where(and(eq(candidateTable.id, id), eq(candidateTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!candidate) return null;

    const submissions = await this.candidateSubmissions(orgId, [id]);
    return { ...candidate, submissions };
  }

  /** Every candidate, with how many assessments they've been sent and their most recent one. */
  async listCandidates() {
    const { orgId } = getSession(this.ctx);
    await this.expireOverdueInOrg(orgId);

    const candidates = await this.db
      .select()
      .from(candidateTable)
      .where(eq(candidateTable.organizationId, orgId))
      .orderBy(desc(candidateTable.createdAt));

    const submissions = await this.candidateSubmissions(
      orgId,
      candidates.map((c) => c.id)
    );
    const byCandidate = new Map<string, typeof submissions>();
    for (const sub of submissions) {
      if (sub.isArchived) continue;
      byCandidate.set(sub.candidateId, [...(byCandidate.get(sub.candidateId) ?? []), sub]);
    }

    return candidates.map((c) => {
      const own = byCandidate.get(c.id) ?? [];
      return { ...c, assessmentCount: own.length, latestSubmission: own[0] ?? null };
    });
  }

  /** Submissions for these candidates with their assessment's title, newest first. */
  private async candidateSubmissions(orgId: string, candidateIds: Id<'candidate'>[]) {
    if (candidateIds.length === 0) return [];
    return this.db
      .select({
        ...getTableColumns(assessmentSubmissionTable),
        assessmentTitle: assessmentTable.title,
      })
      .from(assessmentSubmissionTable)
      .innerJoin(assessmentTable, eq(assessmentTable.id, assessmentSubmissionTable.assessmentId))
      .where(
        and(
          inArray(assessmentSubmissionTable.candidateId, candidateIds),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .orderBy(desc(assessmentSubmissionTable.createdAt));
  }

  // === Submission Management (org-side) ===

  async inviteCandidate(
    assessmentId: Id<'assessment'>,
    params: CreateSubmissionSchema,
    options: { startBy?: string | null; message?: string | null } = {}
  ) {
    const { orgId } = getSession(this.ctx);

    // Verify assessment exists and is active
    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(and(eq(assessmentTable.id, assessmentId), eq(assessmentTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) {
      throw new HTTPException(404, { message: 'Assessment not found' });
    }

    if (assessment.status !== 'active') {
      throw new HTTPException(400, {
        message: 'Assessment must be published before inviting candidates',
      });
    }

    let candidate: CandidateEntity;
    if ('candidateId' in params) {
      const existing = await this.db
        .select()
        .from(candidateTable)
        .where(
          and(eq(candidateTable.id, params.candidateId), eq(candidateTable.organizationId, orgId))
        )
        .then((r) => (r.length > 0 ? r[0] : null));

      if (!existing) {
        throw new HTTPException(404, { message: 'Candidate not found' });
      }
      candidate = existing;
    } else {
      candidate = await this.createCandidate({
        name: params.candidateName,
        email: params.candidateEmail,
      });
    }

    // Runs in one transaction so a failed invite leaves nothing behind (no
    // half-created submission, no usage charged)
    const { submission, alreadyInvited } = await this.db.transaction(async (tx) => {
      // Serialize invites for the same candidate so parallel requests can't both create one
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${`${assessmentId}:${candidate.id}`}))`
      );

      const priorSubmissions = await tx
        .select()
        .from(assessmentSubmissionTable)
        .where(
          and(
            eq(assessmentSubmissionTable.assessmentId, assessmentId),
            eq(assessmentSubmissionTable.candidateId, candidate.id),
            eq(assessmentSubmissionTable.organizationId, orgId)
          )
        );

      // Return an open invite instead of creating, billing and emailing a duplicate
      const now = Date.now();
      const openSubmission = priorSubmissions.find(
        (s) =>
          !s.isArchived &&
          ((s.status === 'not_started' && (!s.startBy || new Date(s.startBy).getTime() > now)) ||
            (s.status === 'in_progress' && (!s.expiresAt || new Date(s.expiresAt).getTime() > now)))
      );

      if (openSubmission) {
        return { submission: openSubmission, alreadyInvited: true };
      }

      const submissionId = generateId('assessmentSubmission');

      // Each candidate counts once per assessment, so retakes are free
      if (priorSubmissions.length === 0) {
        const usageResult = await this.usageService.trackEvent(
          {
            eventType: 'assessment_invite',
            resource: {
              id: submissionId,
              type: 'assessmentSubmission',
            },
            metadata: { assessmentId, candidateId: candidate.id },
          },
          tx
        );

        if (!usageResult.allowed) {
          throw new HTTPException(403, {
            message:
              'You have reached the assessment invite limit for your plan. Upgrade your plan to invite more candidates.',
          });
        }
      }

      const newSubmission = await tx
        .insert(assessmentSubmissionTable)
        .values({
          id: submissionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assessmentId,
          organizationId: orgId,
          candidateId: candidate.id,
          status: 'not_started',
          accessToken: crypto.randomUUID(),
          startBy: options.startBy ?? null,
          inviteMessage: options.message || null,
        })
        .returning()
        .then((r) => r[0]);

      // Create questionSubmission rows for each assessment question link in a
      // single batch insert rather than one round-trip per question.
      const questions = await tx
        .select()
        .from(assessmentQuestionTable)
        .where(
          and(
            eq(assessmentQuestionTable.assessmentId, assessmentId),
            isNull(assessmentQuestionTable.archivedAt)
          )
        )
        .orderBy(asc(assessmentQuestionTable.position));

      if (questions.length > 0) {
        const createdAt = new Date().toISOString();
        await tx.insert(questionSubmissionTable).values(
          questions.map((q) => ({
            id: generateId('questionSubmission'),
            createdAt,
            updatedAt: createdAt,
            submissionId,
            questionId: q.id,
            organizationId: orgId,
            isDraft: true,
          }))
        );
      }

      return { submission: newSubmission, alreadyInvited: false };
    });

    if (alreadyInvited) {
      return {
        ...submission,
        candidate,
        emailSent: undefined as boolean | undefined,
        alreadyInvited: true,
      };
    }

    // Awaited rather than fire-and-forget so the caller can be told whether the
    // invite actually went out. A silent failure here reads to the recruiter as
    // "the candidate was emailed" when they weren't, and the candidate is left
    // waiting on a link that never arrives. A failed send still never fails the
    // invite: the access link comes back either way for the copy-link fallback.
    const emailSent = await this.notifyCandidateOfInvitation({
      orgId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      assessmentTitle: assessment.title,
      submissionId: submission.id,
      accessToken: submission.accessToken,
      startBy: submission.startBy,
      message: submission.inviteMessage,
    });

    return {
      ...submission,
      candidate,
      emailSent: emailSent as boolean | undefined,
      alreadyInvited: false,
    };
  }

  /** Returns whether the invitation email was accepted for delivery. */
  private async notifyCandidateOfInvitation(params: {
    orgId: string;
    candidateName: string;
    candidateEmail: string;
    assessmentTitle: string;
    submissionId: string;
    accessToken: string;
    startBy: string | null;
    message: string | null;
  }): Promise<boolean> {
    try {
      const org = await this.db
        .select()
        .from(organization)
        .where(eq(organization.id, params.orgId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!org) return false;

      const takeLink = `${this.ctx.env.FE_APP_URL}/take/${params.submissionId}?token=${params.accessToken}`;
      const { resendService } = this.ctx.get('appFactory');

      await resendService.sendTransactionalEmail('assessment_invitation', params.candidateEmail, {
        org_name: org.name,
        candidate_name: params.candidateName,
        assessment_title: params.assessmentTitle,
        take_link: takeLink,
        start_by: params.startBy,
        message: params.message,
      });

      return true;
    } catch (err) {
      console.error('Failed to send assessment invitation email', {
        submissionId: params.submissionId,
        error: err,
      });
      reportError(err, { tags: { feature: 'email', email: 'assessment_invitation' } });
      return false;
    }
  }

  /**
   * Invites several candidates at once. Each one succeeds or fails on its own,
   * so one bad address or a plan limit partway through doesn't lose the rest.
   */
  async bulkInvite(assessmentId: Id<'assessment'>, body: BulkInviteSchema) {
    const startBy = body.startByDays
      ? new Date(Date.now() + body.startByDays * 86_400_000).toISOString()
      : null;
    const options = { startBy, message: body.message || null };

    const seen = new Set<string>();
    const results = [];
    for (const entry of body.candidates) {
      const key = 'candidateId' in entry ? entry.candidateId : entry.email.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const params: CreateSubmissionSchema =
        'candidateId' in entry
          ? { candidateId: entry.candidateId }
          : {
              candidateName: entry.name ?? nameFromEmail(entry.email),
              candidateEmail: entry.email,
            };
      try {
        const invite = await this.inviteCandidate(assessmentId, params, options);
        results.push({
          status: invite.alreadyInvited ? ('already_invited' as const) : ('invited' as const),
          candidateId: invite.candidate.id,
          name: invite.candidate.name,
          email: invite.candidate.email,
          submissionId: invite.id,
          accessToken: invite.accessToken,
          emailSent: invite.emailSent ?? null,
        });
      } catch (err) {
        if (!(err instanceof HTTPException)) reportError(err, { tags: { feature: 'bulk_invite' } });
        results.push({
          status: 'failed' as const,
          name: 'name' in entry ? (entry.name ?? null) : null,
          email: 'email' in entry ? entry.email : null,
          error: err instanceof HTTPException ? err.message : 'Something went wrong',
        });
      }
    }
    return { results };
  }

  /** Loads a submission in the current org with its assessment and candidate. */
  private async loadForTeam(submissionId: Id<'assessmentSubmission'>) {
    const { orgId } = getSession(this.ctx);
    const row = await this.db
      .select({
        submission: assessmentSubmissionTable,
        assessment: assessmentTable,
        candidate: candidateTable,
      })
      .from(assessmentSubmissionTable)
      .innerJoin(assessmentTable, eq(assessmentTable.id, assessmentSubmissionTable.assessmentId))
      .innerJoin(candidateTable, eq(candidateTable.id, assessmentSubmissionTable.candidateId))
      .where(
        and(
          eq(assessmentSubmissionTable.id, submissionId),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .then((r) => r[0]);
    if (!row) throw new HTTPException(404, { message: 'Submission not found' });
    return { orgId, ...row };
  }

  /** Sends the invite email again, with the same link, deadline and message. */
  async resendInvite(submissionId: Id<'assessmentSubmission'>) {
    const { orgId, submission, assessment, candidate } = await this.loadForTeam(submissionId);

    if (submission.isArchived) {
      throw new HTTPException(400, { message: 'This invite was cancelled' });
    }
    if (assessment.status !== 'active') {
      throw new HTTPException(400, { message: 'This assessment is closed' });
    }
    if (submission.status !== 'not_started') {
      throw new HTTPException(400, { message: 'The candidate has already started' });
    }
    if (submission.startBy && new Date(submission.startBy) < new Date()) {
      throw new HTTPException(400, {
        message: 'This invite has expired. Extend the deadline before resending.',
      });
    }

    const emailSent = await this.notifyCandidateOfInvitation({
      orgId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      assessmentTitle: assessment.title,
      submissionId: submission.id,
      accessToken: submission.accessToken,
      startBy: submission.startBy,
      message: submission.inviteMessage,
    });
    return { emailSent };
  }

  /**
   * Gives a candidate more time: to finish, if they're mid-attempt, or to
   * start, if their invite has a deadline. Counts from now if it already passed.
   */
  async extendSubmission(submissionId: Id<'assessmentSubmission'>, minutes: number) {
    const { submission } = await this.loadForTeam(submissionId);
    const later = (from: string) =>
      new Date(Math.max(new Date(from).getTime(), Date.now()) + minutes * 60_000).toISOString();

    if (submission.isArchived) {
      throw new HTTPException(400, { message: 'This invite was cancelled' });
    }

    let update: { expiresAt: string } | { startBy: string };
    if (submission.status === 'in_progress') {
      if (!submission.expiresAt) {
        throw new HTTPException(400, { message: 'This assessment has no time limit' });
      }
      update = { expiresAt: later(submission.expiresAt) };
    } else if (submission.status === 'not_started') {
      if (!submission.startBy) {
        throw new HTTPException(400, { message: 'This invite has no deadline' });
      }
      update = { startBy: later(submission.startBy) };
    } else {
      throw new HTTPException(400, { message: 'This attempt has already ended' });
    }

    return this.db
      .update(assessmentSubmissionTable)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);
  }

  async listSubmissions(assessmentId: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    await this.expireOverdue(
      and(
        eq(assessmentSubmissionTable.assessmentId, assessmentId),
        eq(assessmentSubmissionTable.organizationId, orgId)
      )
    );

    const submissions = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(
        and(
          eq(assessmentSubmissionTable.assessmentId, assessmentId),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .orderBy(desc(assessmentSubmissionTable.createdAt));

    // Join with candidates. Fetch every referenced candidate in a single query
    // rather than one round-trip per submission.
    const candidateIds = [...new Set(submissions.map((s) => s.candidateId))] as Id<'candidate'>[];
    const candidates: CandidateEntity[] =
      candidateIds.length > 0
        ? await this.db
            .select()
            .from(candidateTable)
            .where(inArray(candidateTable.id, candidateIds))
        : [];

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    return submissions.map((s) => ({
      ...s,
      candidate: candidateMap.get(s.candidateId) ?? null,
    }));
  }

  async getSubmissionDetails(submissionId: Id<'assessmentSubmission'>) {
    const { orgId } = getSession(this.ctx);

    await this.expireOverdue(
      and(
        eq(assessmentSubmissionTable.id, submissionId),
        eq(assessmentSubmissionTable.organizationId, orgId)
      )
    );

    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(
        and(
          eq(assessmentSubmissionTable.id, submissionId),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) return null;

    const candidate = await this.db
      .select()
      .from(candidateTable)
      .where(eq(candidateTable.id, submission.candidateId))
      .then((r) => (r.length > 0 ? r[0] : null));

    // All assessment questions (ordered) with their library titles, so the
    // detail view can list every question even if the candidate never attempted
    // it.
    const links = await this.db
      .select({ link: assessmentQuestionTable, question: questionLibraryTable })
      .from(assessmentQuestionTable)
      .innerJoin(
        questionLibraryTable,
        eq(assessmentQuestionTable.questionId, questionLibraryTable.id)
      )
      .where(eq(assessmentQuestionTable.assessmentId, submission.assessmentId as Id<'assessment'>))
      .orderBy(asc(assessmentQuestionTable.position));

    const allQuestionSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(eq(questionSubmissionTable.submissionId, submissionId));

    // Resolve the best/draft submission per assessment question up front so we
    // know which questionSubmission rows carry test results worth fetching.
    const perQuestion = links.map((l) => {
      const aqId = l.link.id;
      const forQuestion = allQuestionSubmissions.filter((qs) => qs.questionId === aqId);
      const best =
        forQuestion
          .filter((qs) => !qs.isDraft)
          .sort(
            (a, b) => (b.score ?? -1) - (a.score ?? -1) || (a.createdAt < b.createdAt ? 1 : -1)
          )[0] ?? null;
      const draft = forQuestion.find((qs) => qs.isDraft) ?? null;
      return { link: l, best, draft };
    });

    // Batch-fetch every test result for all "best" submissions in one query,
    // then the test case definitions they reference in a second query, rather
    // than two round-trips per question.
    const bestIds = perQuestion
      .map((p) => p.best?.id)
      .filter((id): id is Id<'questionSubmission'> => Boolean(id));
    const allResults =
      bestIds.length > 0
        ? await this.db
            .select()
            .from(testCaseResultTable)
            .where(inArray(testCaseResultTable.questionSubmissionId, bestIds))
        : [];

    // Results carry a snapshot of their test case. Only rows written before
    // snapshots existed need the live definition, and only if it still exists.
    const allDefIds = [
      ...new Set(
        allResults
          .filter((r) => r.args === null && r.testCaseId)
          .map((r) => r.testCaseId as Id<'questionLibraryTestCase'>)
      ),
    ];
    const allDefs =
      allDefIds.length > 0
        ? await this.db
            .select()
            .from(questionLibraryTestCaseTable)
            .where(inArray(questionLibraryTestCaseTable.id, allDefIds))
        : [];
    const defById = new Map(allDefs.map((d) => [d.id, d]));

    const resultsByQuestionSubmissionId = new Map<string, TestCaseResultEntity[]>();
    for (const r of allResults) {
      const existing = resultsByQuestionSubmissionId.get(r.questionSubmissionId) || [];
      existing.push(r);
      resultsByQuestionSubmissionId.set(r.questionSubmissionId, existing);
    }

    // One entry per assessment question: the best non-draft submission (the
    // graded attempt the candidate actually submitted) enriched with the test
    // case definitions, falling back to the draft (their latest editor code) if
    // they never submitted.
    const questions = perQuestion.map(({ link: l, best, draft }) => {
      const aqId = l.link.id;
      const chosen = best ?? draft;

      // Per-test results, enriched with the test case definition (label, args,
      // expected) so reviewers can see the inputs behind each pass/fail.
      let testCaseResults: Array<
        TestCaseResultEntity & {
          label: string;
          args: unknown[];
          expectedReturn: unknown;
          isHidden: boolean;
          position: number;
        }
      > = [];
      if (best) {
        const results = resultsByQuestionSubmissionId.get(best.id) ?? [];
        testCaseResults = results
          .map((r) => {
            // Prefer the snapshot: it shows the test as the candidate was
            // graded on it, even if the question has been edited since.
            if (r.args !== null) {
              return {
                ...r,
                label: r.label ?? '',
                args: r.args,
                expectedReturn: r.expectedReturn ?? null,
                isHidden: r.isHidden ?? false,
                position: r.position ?? 0,
              };
            }
            const def = r.testCaseId
              ? defById.get(r.testCaseId as Id<'questionLibraryTestCase'>)
              : undefined;
            return {
              ...r,
              label: def?.label ?? '',
              args: def?.args ?? [],
              expectedReturn: def?.expectedReturn ?? null,
              isHidden: def?.isHidden ?? false,
              position: def?.position ?? 0,
            };
          })
          .sort((a, b) => a.position - b.position);
      }

      return {
        assessmentQuestionId: aqId,
        title: l.question.title,
        position: l.link.position,
        points: l.link.points,
        isArchived: l.link.archivedAt !== null,
        status: best ? 'submitted' : draft?.code ? 'draft' : 'not_attempted',
        code: chosen?.code ?? '',
        language: best?.language ?? draft?.language ?? submission.selectedLanguage ?? null,
        questionSubmissionId: best?.id ?? null,
        score: best?.score ?? null,
        maxScore: best?.maxScore ?? null,
        testCaseResults,
      };
    });

    return {
      ...submission,
      candidate,
      // Removed questions stay visible where the candidate actually worked on
      // them; untouched ones are just noise.
      questions: questions.filter((q) => !q.isArchived || q.status !== 'not_attempted'),
    };
  }

  async gradeSubmission(submissionId: Id<'assessmentSubmission'>, grades: GradeSubmissionSchema) {
    const { orgId } = getSession(this.ctx);

    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(
        and(
          eq(assessmentSubmissionTable.id, submissionId),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    const attemptEnded = ['submitted', 'expired', 'graded'].includes(submission.status);
    if (!attemptEnded && (grades.decision || grades.questionScores?.length)) {
      throw new HTTPException(400, {
        message: 'Scores and decisions can only be set after the candidate finishes',
      });
    }

    let weightedTotal: number | null = null;
    let weightedMax: number | null = null;
    if (grades.questionScores?.length) {
      // Only rows from this attempt can be overridden, never another org's.
      const ids = grades.questionScores.map((qs) => qs.questionSubmissionId);
      const rows = await this.db
        .select()
        .from(questionSubmissionTable)
        .where(
          and(
            inArray(questionSubmissionTable.id, ids),
            eq(questionSubmissionTable.submissionId, submissionId)
          )
        );
      const rowById = new Map(rows.map((r) => [r.id, r]));

      for (const qs of grades.questionScores) {
        const row = rowById.get(qs.questionSubmissionId);
        if (!row) {
          throw new HTTPException(404, { message: 'Question submission not found' });
        }
        if (row.maxScore != null && qs.score > row.maxScore) {
          throw new HTTPException(400, {
            message: `Score can't be higher than ${row.maxScore}`,
          });
        }
      }

      for (const qs of grades.questionScores) {
        const row = rowById.get(qs.questionSubmissionId) as (typeof rows)[number];
        await this.db
          .update(questionSubmissionTable)
          .set({ score: qs.score, updatedAt: new Date().toISOString() })
          .where(eq(questionSubmissionTable.id, row.id));

        // Scoring uses the best submit per question, so a lowered score would
        // let an earlier, higher-scoring submit take over. Cap those too.
        await this.db
          .update(questionSubmissionTable)
          .set({ score: sql`least(${questionSubmissionTable.score}, ${qs.score})` })
          .where(
            and(
              eq(questionSubmissionTable.submissionId, submissionId),
              eq(questionSubmissionTable.questionId, row.questionId),
              eq(questionSubmissionTable.isDraft, false),
              ne(questionSubmissionTable.id, row.id)
            )
          );
      }

      const aggregate = await this.computeWeightedAggregate(submissionId);
      weightedTotal = aggregate.totalScore;
      weightedMax = aggregate.maxScore;
    }

    const now = new Date().toISOString();
    const decisionUpdate =
      grades.decision === undefined
        ? {}
        : { decision: grades.decision, reviewedAt: grades.decision ? now : null };

    return this.db
      .update(assessmentSubmissionTable)
      .set({
        totalScore: weightedTotal ?? submission.totalScore,
        maxScore: weightedMax ?? submission.maxScore,
        gradingNotes: grades.gradingNotes ?? submission.gradingNotes,
        ...decisionUpdate,
        updatedAt: now,
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);
  }

  /**
   * Archive or unarchive a whole assessment submission. Archiving only flags the
   * submission so it can be hidden from the default list; it does not change the
   * candidate's score or status, and is fully reversible.
   */
  async setSubmissionArchived(submissionId: Id<'assessmentSubmission'>, archived: boolean) {
    const { orgId } = getSession(this.ctx);

    const updated = await this.db
      .update(assessmentSubmissionTable)
      .set({
        isArchived: archived,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(assessmentSubmissionTable.id, submissionId),
          eq(assessmentSubmissionTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!updated) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    return updated;
  }

  /**
   * Compute weighted assessment score from per-question best submissions:
   *   weightedScore(q) = (bestQS.score / bestQS.maxScore) * aq.points
   *   totalScore       = round(sum(weightedScore))
   *   maxScore         = sum(aq.points)
   */
  private async computeWeightedAggregate(
    submissionId: Id<'assessmentSubmission'>
  ): Promise<{ totalScore: number; maxScore: number }> {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      return { totalScore: 0, maxScore: 0 };
    }

    // Removed questions don't count toward new scores. Scores computed before
    // a question was removed are stored on the submission and left alone.
    const assessmentQuestions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(
        and(
          eq(assessmentQuestionTable.assessmentId, submission.assessmentId as Id<'assessment'>),
          isNull(assessmentQuestionTable.archivedAt)
        )
      );

    // Fetch every non-draft submission for this attempt in one query (ordered
    // by score desc), then keep the highest-scoring one per question in memory.
    const nonDraftSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(
        and(
          eq(questionSubmissionTable.submissionId, submissionId),
          eq(questionSubmissionTable.isDraft, false)
        )
      )
      .orderBy(desc(questionSubmissionTable.score));

    const bestByQuestionId = new Map<string, (typeof nonDraftSubmissions)[number]>();
    for (const qs of nonDraftSubmissions) {
      if (!bestByQuestionId.has(qs.questionId)) {
        bestByQuestionId.set(qs.questionId, qs);
      }
    }

    let weightedTotal = 0;
    let weightedMax = 0;

    for (const aq of assessmentQuestions) {
      weightedMax += aq.points;

      const bestSubmission = bestByQuestionId.get(aq.id) ?? null;

      if (bestSubmission?.maxScore && bestSubmission.maxScore > 0) {
        const ratio = (bestSubmission.score ?? 0) / bestSubmission.maxScore;
        weightedTotal += ratio * aq.points;
      }
    }

    return {
      totalScore: Math.round(weightedTotal),
      maxScore: weightedMax,
    };
  }

  /**
   * Resolves an `assessmentQuestion.id` to the underlying library question row.
   * The library question carries the signature (functionName, parameters,
   * returnType) needed by the runner and the resolved starter code map.
   */
  private async resolveLibraryQuestion(assessmentQuestionId: Id<'assessmentQuestion'>) {
    const row = await this.db
      .select({ link: assessmentQuestionTable, question: questionLibraryTable })
      .from(assessmentQuestionTable)
      .innerJoin(
        questionLibraryTable,
        eq(assessmentQuestionTable.questionId, questionLibraryTable.id)
      )
      .where(eq(assessmentQuestionTable.id, assessmentQuestionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!row) {
      throw new HTTPException(404, { message: 'Question not found' });
    }
    return row.question;
  }

  // === Candidate-Facing Methods (token-authenticated, no session required) ===

  // Archiving an invite revokes its link; unarchiving restores it.
  async getSubmissionForToken(token: string): Promise<AssessmentSubmissionEntity | null> {
    return this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(
        and(
          eq(assessmentSubmissionTable.accessToken, token),
          eq(assessmentSubmissionTable.isArchived, false)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));
  }

  async getSubmissionByToken(token: string) {
    const submission = await this.getSubmissionForToken(token);
    if (!submission) return null;

    // Load assessment
    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(eq(assessmentTable.id, submission.assessmentId as Id<'assessment'>))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) return null;

    // Load questions via join: assessmentQuestion → questionLibrary
    const rows = await this.db
      .select({
        link: assessmentQuestionTable,
        question: questionLibraryTable,
      })
      .from(assessmentQuestionTable)
      .innerJoin(
        questionLibraryTable,
        eq(assessmentQuestionTable.questionId, questionLibraryTable.id)
      )
      .where(
        and(
          eq(assessmentQuestionTable.assessmentId, assessment.id),
          isNull(assessmentQuestionTable.archivedAt)
        )
      )
      .orderBy(asc(assessmentQuestionTable.position));

    // All question submissions for this attempt in one query. Used both to pick
    // the best non-draft per question (highest score wins) and to surface the
    // candidate's current submission row per question.
    const allSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(eq(questionSubmissionTable.submissionId, submission.id))
      .orderBy(desc(questionSubmissionTable.score));

    const bestByQuestionId = new Map<string, { score: number | null; maxScore: number | null }>();
    const submissionByQuestionId = new Map<string, (typeof allSubmissions)[number]>();
    for (const qs of allSubmissions) {
      if (!qs.isDraft && !bestByQuestionId.has(qs.questionId)) {
        bestByQuestionId.set(qs.questionId, { score: qs.score, maxScore: qs.maxScore });
      }
      // Surface the draft row (the candidate's live editor code) when present,
      // otherwise fall back to any submission for the question.
      const existing = submissionByQuestionId.get(qs.questionId);
      if (!existing || (qs.isDraft && !existing.isDraft)) {
        submissionByQuestionId.set(qs.questionId, qs);
      }
    }

    // All visible test cases for every question on the assessment in one query,
    // grouped by library question id.
    const libraryQuestionIds = rows.map((r) => r.question.id);
    const allVisibleTestCases =
      libraryQuestionIds.length > 0
        ? await this.db
            .select()
            .from(questionLibraryTestCaseTable)
            .where(
              and(
                inArray(questionLibraryTestCaseTable.questionId, libraryQuestionIds),
                eq(questionLibraryTestCaseTable.isHidden, false)
              )
            )
            .orderBy(asc(questionLibraryTestCaseTable.position))
        : [];

    const testCasesByQuestionId = new Map<string, typeof allVisibleTestCases>();
    for (const tc of allVisibleTestCases) {
      const existing = testCasesByQuestionId.get(tc.questionId) || [];
      existing.push(tc);
      testCasesByQuestionId.set(tc.questionId, existing);
    }

    const questionsWithData = [];
    for (const r of rows) {
      // Only visible test cases for candidate
      const testCases = testCasesByQuestionId.get(r.question.id) ?? [];

      const questionSubmission = submissionByQuestionId.get(r.link.id) ?? null;

      const best = bestByQuestionId.get(r.link.id) ?? null;

      const signature = {
        functionName: r.question.functionName,
        parameters: r.question.parameters,
        returnType: r.question.returnType,
      };
      // Resolved starter code per allowed language: override if the author set
      // one, else the auto-generated default from the signature. Restricted to
      // languages that support function mode (e.g. Java/Go return nothing here
      // even if listed in allowedLanguages).
      const resolvedStarterCode = resolveStarterCode(
        signature,
        r.question.starterCode,
        assessment.allowedLanguages
      );

      questionsWithData.push({
        id: r.link.id,
        createdAt: r.link.createdAt,
        updatedAt: r.link.updatedAt,
        assessmentId: r.link.assessmentId,
        organizationId: r.link.organizationId,
        questionId: r.question.id,
        position: r.link.position,
        title: r.question.title,
        description: r.question.description,
        functionName: r.question.functionName,
        parameters: r.question.parameters,
        returnType: r.question.returnType,
        resolvedStarterCode,
        timeLimitSeconds: r.question.timeLimitSeconds,
        testCases,
        questionSubmission,
        bestScore: best?.score ?? null,
        maxScore: best?.maxScore ?? null,
      });
    }

    const candidate = await this.db
      .select()
      .from(candidateTable)
      .where(eq(candidateTable.id, submission.candidateId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!candidate) return null;

    return {
      submission: {
        id: submission.id,
        status: submission.status,
        selectedLanguage: submission.selectedLanguage,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        expiresAt: submission.expiresAt,
        startBy: submission.startBy,
        candidateEmail: candidate.email,
        candidateName: candidate.name,
      },
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        status: assessment.status,
        mode: assessment.mode,
        allowedLanguages: assessment.allowedLanguages,
        timeLimitSeconds: assessment.timeLimitSeconds,
        questions: questionsWithData,
      },
    };
  }

  async startAssessment(submissionId: Id<'assessmentSubmission'>, params: StartAssessmentSchema) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'not_started') {
      throw new HTTPException(400, { message: 'Assessment has already been started' });
    }

    // Load assessment to get time limit and validate language
    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(eq(assessmentTable.id, submission.assessmentId as Id<'assessment'>))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) {
      throw new HTTPException(404, { message: 'Assessment not found' });
    }

    if (assessment.status !== 'active') {
      throw new HTTPException(400, { message: 'This assessment is closed' });
    }

    if (submission.startBy && new Date(submission.startBy) < new Date()) {
      throw new HTTPException(400, { message: 'This invite has expired' });
    }

    if (!assessment.allowedLanguages.includes(params.selectedLanguage)) {
      throw new HTTPException(400, {
        message: 'Selected language is not allowed for this assessment',
      });
    }

    const now = new Date();
    const startedAt = now.toISOString();
    const expiresAt = assessment.timeLimitSeconds
      ? new Date(now.getTime() + assessment.timeLimitSeconds * 1000).toISOString()
      : null;

    return this.db
      .update(assessmentSubmissionTable)
      .set({
        status: 'in_progress',
        selectedLanguage: params.selectedLanguage,
        startedAt,
        expiresAt,
        updatedAt: startedAt,
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);
  }

  async saveCode(submissionId: Id<'assessmentSubmission'>, params: SaveCodeSchema) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'in_progress') {
      throw new HTTPException(400, { message: 'Assessment is not in progress' });
    }

    // Only update the draft row (auto-save working code)
    const updated = await this.db
      .update(questionSubmissionTable)
      .set({
        code: params.code,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(questionSubmissionTable.submissionId, submissionId),
          eq(questionSubmissionTable.questionId, params.questionId),
          eq(questionSubmissionTable.isDraft, true)
        )
      )
      .returning()
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!updated) {
      throw new HTTPException(404, { message: 'Question submission not found' });
    }

    return updated;
  }

  /**
   * Submit code for a question - runs ALL test cases (visible + hidden)
   * Creates a new submission record with test results
   */
  async submitCode(
    submissionId: Id<'assessmentSubmission'>,
    params: { questionId: Id<'assessmentQuestion'>; code: string }
  ) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'in_progress') {
      throw new HTTPException(400, { message: 'Assessment is not in progress' });
    }

    if (!submission.selectedLanguage) {
      throw new HTTPException(400, { message: 'No language selected' });
    }

    // Resolve assessmentQuestion → library question (includes signature)
    const libraryQuestion = await this.resolveLibraryQuestion(params.questionId);

    // Get ALL test cases (visible + hidden) from library
    const testCases = await this.db
      .select()
      .from(questionLibraryTestCaseTable)
      .where(eq(questionLibraryTestCaseTable.questionId, libraryQuestion.id))
      .orderBy(asc(questionLibraryTestCaseTable.position));

    // Run code against all test cases
    const codeRunService = new AssessmentCodeRunService(this.ctx);
    const results = await codeRunService.runTestCases({
      submissionId,
      code: params.code,
      language: submission.selectedLanguage as AssessmentLanguage,
      signature: {
        functionName: libraryQuestion.functionName,
        parameters: libraryQuestion.parameters,
        returnType: libraryQuestion.returnType,
      },
      testCases,
    });

    // Calculate score (each test = 1 point)
    const passedCount = results.filter((r) => r.passed).length;
    const maxScore = testCases.length;

    // Persist questionSubmission + per-test results atomically so a partial
    // failure can never leave orphan results without a parent submission row.
    const questionSubmissionId = generateId('questionSubmission');
    const newQuestionSubmission = await this.db.transaction(async (tx) => {
      const qs = await tx
        .insert(questionSubmissionTable)
        .values({
          id: questionSubmissionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          submissionId: submissionId,
          questionId: params.questionId,
          organizationId: submission.organizationId,
          code: params.code,
          language: submission.selectedLanguage,
          isDraft: false,
          score: passedCount,
          maxScore: maxScore,
        })
        .returning()
        .then((r) => r[0]);

      if (results.length > 0) {
        const testCaseById = new Map(testCases.map((tc) => [tc.id, tc]));
        await tx.insert(testCaseResultTable).values(
          results.map((result) => {
            // Snapshot the test case so this result still reads correctly
            // after the question is edited or the test case is deleted.
            const tc = testCaseById.get(result.testCaseId as Id<'questionLibraryTestCase'>);
            return {
              id: generateId('testCaseResult'),
              createdAt: new Date().toISOString(),
              questionSubmissionId: questionSubmissionId,
              testCaseId: result.testCaseId,
              organizationId: submission.organizationId,
              passed: result.passed,
              failureReason: result.failureReason,
              actualOutput: result.actualOutput,
              stderr: result.stderr,
              exitCode: result.exitCode,
              executionTimeMs: result.executionTimeMs,
              label: tc?.label ?? '',
              args: tc?.args ?? [],
              expectedReturn: tc?.expectedReturn ?? null,
              isHidden: tc?.isHidden ?? false,
              position: tc?.position ?? 0,
            };
          })
        );
      }

      return qs;
    });

    // Return results - only show visible test results to candidate
    const visibleResults = results.filter((r) => {
      const tc = testCases.find((tc) => tc.id === r.testCaseId);
      return tc && !tc.isHidden;
    });

    return {
      questionSubmission: newQuestionSubmission,
      score: passedCount,
      maxScore,
      visibleResults,
    };
  }

  /**
   * Get submission history for a question (all non-draft submissions)
   */
  async getSubmissionHistory(
    submissionId: Id<'assessmentSubmission'>,
    questionId: Id<'assessmentQuestion'>
  ) {
    // Get all actual submissions (not drafts)
    const submissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(
        and(
          eq(questionSubmissionTable.submissionId, submissionId),
          eq(questionSubmissionTable.questionId, questionId),
          eq(questionSubmissionTable.isDraft, false)
        )
      )
      .orderBy(desc(questionSubmissionTable.createdAt));

    return submissions;
  }

  async changeLanguage(submissionId: Id<'assessmentSubmission'>, params: ChangeLanguageSchema) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'in_progress') {
      throw new HTTPException(400, { message: 'Assessment is not in progress' });
    }

    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(eq(assessmentTable.id, submission.assessmentId as Id<'assessment'>))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) {
      throw new HTTPException(404, { message: 'Assessment not found' });
    }

    if (assessment.status !== 'active') {
      throw new HTTPException(400, { message: 'This assessment is closed' });
    }

    if (submission.startBy && new Date(submission.startBy) < new Date()) {
      throw new HTTPException(400, { message: 'This invite has expired' });
    }

    if (!assessment.allowedLanguages.includes(params.selectedLanguage)) {
      throw new HTTPException(400, {
        message: 'Selected language is not allowed for this assessment',
      });
    }

    return this.db
      .update(assessmentSubmissionTable)
      .set({
        selectedLanguage: params.selectedLanguage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);
  }

  /** Expires every overdue attempt across all orgs. Run from the cron. */
  async expireAllOverdue() {
    await this.expireOverdue(undefined);
  }

  /** Expires overdue attempts in one org, for pages that show attempt status. */
  async expireOverdueInOrg(orgId: string) {
    await this.expireOverdue(eq(assessmentSubmissionTable.organizationId, orgId));
  }

  /**
   * checkExpiration only runs on candidate requests, so an attempt the candidate
   * walked away from would read as in progress forever. Recruiter-facing reads
   * call this first to expire (and score) any overdue attempts in scope.
   */
  private async expireOverdue(scope: SQL | undefined) {
    const overdue = await this.db
      .select({ id: assessmentSubmissionTable.id })
      .from(assessmentSubmissionTable)
      .where(
        and(
          scope,
          eq(assessmentSubmissionTable.status, 'in_progress'),
          lt(assessmentSubmissionTable.expiresAt, sql`now()`)
        )
      );

    for (const { id } of overdue) {
      await this.checkExpiration(id as Id<'assessmentSubmission'>);
    }
  }

  async checkExpiration(submissionId: Id<'assessmentSubmission'>): Promise<boolean> {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) return false;

    if (
      submission.status === 'in_progress' &&
      submission.expiresAt &&
      new Date(submission.expiresAt) < new Date()
    ) {
      // Running out of time still ends the attempt, but it should not throw the
      // work away: score whatever the candidate already submitted per question
      // so an expired attempt shows up with a real score instead of a blank one.
      const { totalScore, maxScore } = await this.computeWeightedAggregate(submissionId);

      // Every candidate route calls this, so concurrent requests can race here.
      // Gating the update on the status still being 'in_progress' means exactly
      // one of them wins and the rest no-op.
      const won = await this.db
        .update(assessmentSubmissionTable)
        .set({
          status: 'expired',
          totalScore,
          maxScore,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(assessmentSubmissionTable.id, submissionId),
            eq(assessmentSubmissionTable.status, 'in_progress')
          )
        )
        .returning({ id: assessmentSubmissionTable.id })
        .then((r) => r.length > 0);

      // Attempts that ran out long ago (before this sweep existed) are marked
      // expired quietly rather than emailing the team about stale history.
      const expiredRecently =
        Date.now() - new Date(submission.expiresAt).getTime() < EXPIRY_NOTIFY_WINDOW_MS;
      if (won && expiredRecently) {
        this.ctx.executionCtx.waitUntil(
          this.dispatchSubmissionNotifications(submissionId, 'expired')
        );
      }
      return true;
    }

    return false;
  }

  async runVisibleTests(
    submissionId: Id<'assessmentSubmission'>,
    params: { questionId: Id<'assessmentQuestion'>; code: string }
  ) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'in_progress') {
      throw new HTTPException(400, { message: 'Assessment is not in progress' });
    }

    if (!submission.selectedLanguage) {
      throw new HTTPException(400, { message: 'No language selected' });
    }

    // Resolve assessmentQuestion → library question (includes signature)
    const libraryQuestion = await this.resolveLibraryQuestion(params.questionId);

    // Get visible test cases from library
    const testCases = await this.db
      .select()
      .from(questionLibraryTestCaseTable)
      .where(
        and(
          eq(questionLibraryTestCaseTable.questionId, libraryQuestion.id),
          eq(questionLibraryTestCaseTable.isHidden, false)
        )
      )
      .orderBy(asc(questionLibraryTestCaseTable.position));

    if (testCases.length === 0) {
      return { results: [] };
    }

    const codeRunService = new AssessmentCodeRunService(this.ctx);
    const results = await codeRunService.runTestCases({
      submissionId,
      code: params.code,
      language: submission.selectedLanguage as AssessmentLanguage,
      signature: {
        functionName: libraryQuestion.functionName,
        parameters: libraryQuestion.parameters,
        returnType: libraryQuestion.returnType,
      },
      testCases,
    });

    return { results };
  }

  async submitAssessment(submissionId: Id<'assessmentSubmission'>) {
    const submission = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!submission) {
      throw new HTTPException(404, { message: 'Submission not found' });
    }

    if (submission.status !== 'in_progress') {
      throw new HTTPException(400, { message: 'Assessment is not in progress' });
    }

    const { totalScore, maxScore } = await this.computeWeightedAggregate(submissionId);

    const updated = await this.db
      .update(assessmentSubmissionTable)
      .set({
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        totalScore,
        maxScore,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);

    this.ctx.executionCtx.waitUntil(this.dispatchSubmissionNotifications(updated.id, 'submitted'));

    return {
      ...updated,
      totalScore,
      maxScore,
    };
  }

  private async dispatchSubmissionNotifications(
    submissionId: Id<'assessmentSubmission'>,
    endedBy: 'submitted' | 'expired'
  ): Promise<void> {
    try {
      const submission = await this.db
        .select()
        .from(assessmentSubmissionTable)
        .where(eq(assessmentSubmissionTable.id, submissionId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!submission) return;

      const assessment = await this.db
        .select()
        .from(assessmentTable)
        .where(eq(assessmentTable.id, submission.assessmentId as Id<'assessment'>))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!assessment) return;

      const candidate = await this.db
        .select()
        .from(candidateTable)
        .where(eq(candidateTable.id, submission.candidateId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!candidate) return;

      const org = await this.db
        .select()
        .from(organization)
        .where(eq(organization.id, submission.organizationId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!org) return;

      const { resendService } = this.ctx.get('appFactory');
      const viewLink = `${this.ctx.env.FE_APP_URL}/assessments/${assessment.id}/submissions/${submission.id}`;

      const sends: Promise<void>[] = [];

      // Receipt confirmation to the candidate (no score — results stay private
      // to the org). Skipped on expiry: they never pressed Submit.
      if (endedBy === 'submitted') {
        sends.push(
          resendService
            .sendTransactionalEmail('submission_confirmation', candidate.email, {
              candidate_name: candidate.name,
              assessment_title: assessment.title,
              org_name: org.name,
            })
            .catch((err) => {
              console.error('Failed to send submission confirmation email', {
                recipient: candidate.email,
                submissionId,
                error: err,
              });
              reportError(err, { tags: { feature: 'email', email: 'submission_confirmation' } });
            })
        );
      }

      // Notify each org member that a submission came in.
      const recipients = await this.db
        .select({ email: user.email })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, submission.organizationId));

      for (const r of recipients) {
        sends.push(
          resendService
            .sendTransactionalEmail('assessment_submission', r.email, {
              org_name: org.name,
              candidate_name: candidate.name,
              candidate_email: candidate.email,
              assessment_title: assessment.title,
              score: submission.totalScore,
              max_score: submission.maxScore,
              submitted_at:
                submission.submittedAt ?? submission.expiresAt ?? new Date().toISOString(),
              view_link: viewLink,
              ended_by: endedBy,
            })
            .catch((err) => {
              console.error('Failed to send assessment submission email', {
                recipient: r.email,
                submissionId,
                error: err,
              });
              reportError(err, { tags: { feature: 'email', email: 'assessment_submission' } });
            })
        );
      }

      await Promise.all(sends);
    } catch (err) {
      console.error('Failed to dispatch assessment submission notifications', {
        submissionId,
        error: err,
      });
      reportError(err, { tags: { feature: 'email', email: 'submission_dispatch' } });
    }
  }
}
