import { generateId, Id } from '@coderscreen/common/id';
import { assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import {
  assessmentSubmissionTable,
  AssessmentSubmissionEntity,
} from '@coderscreen/db/assessmentSubmission.db';
import { candidateTable, CandidateEntity } from '@coderscreen/db/candidate.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { testCaseResultTable } from '@coderscreen/db/testCaseResult.db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import { CreateSubmissionSchema, GradeSubmissionSchema } from '@/schema/assessment.zod';

export class AssessmentSubmissionService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
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

    const candidate = await this.db
      .select()
      .from(candidateTable)
      .where(and(eq(candidateTable.id, id), eq(candidateTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!candidate) return null;

    const submissions = await this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.candidateId, id))
      .orderBy(desc(assessmentSubmissionTable.createdAt));

    return { ...candidate, submissions };
  }

  async listCandidates() {
    const { orgId } = getSession(this.ctx);

    return this.db
      .select()
      .from(candidateTable)
      .where(eq(candidateTable.organizationId, orgId))
      .orderBy(desc(candidateTable.createdAt));
  }

  // === Submission Management (org-side) ===

  async inviteCandidate(assessmentId: Id<'assessment'>, params: CreateSubmissionSchema) {
    const { orgId } = getSession(this.ctx);

    // Resolve candidate
    let candidate: CandidateEntity;
    if (params.candidateId) {
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
    } else if (params.candidateName && params.candidateEmail) {
      candidate = await this.createCandidate({
        name: params.candidateName,
        email: params.candidateEmail,
      });
    } else {
      throw new HTTPException(400, {
        message: 'Provide either candidateId or both candidateName and candidateEmail',
      });
    }

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
      throw new HTTPException(400, { message: 'Assessment must be published before inviting candidates' });
    }

    // Create submission
    const submissionId = generateId('assessmentSubmission');
    const accessToken = crypto.randomUUID();

    const submission = await this.db
      .insert(assessmentSubmissionTable)
      .values({
        id: submissionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assessmentId,
        organizationId: orgId,
        candidateId: candidate.id,
        status: 'not_started',
        accessToken,
      })
      .returning()
      .then((r) => r[0]);

    // Create questionSubmission rows for each question
    const questions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(eq(assessmentQuestionTable.assessmentId, assessmentId))
      .orderBy(asc(assessmentQuestionTable.position));

    for (const q of questions) {
      await this.db.insert(questionSubmissionTable).values({
        id: generateId('questionSubmission'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionId: submissionId,
        questionId: q.id,
        organizationId: orgId,
      });
    }

    return { ...submission, candidate };
  }

  async listSubmissions(assessmentId: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

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

    // Join with candidates
    const candidateIds = [...new Set(submissions.map((s) => s.candidateId))];
    const candidates: CandidateEntity[] = [];
    for (const cId of candidateIds) {
      const c = await this.db
        .select()
        .from(candidateTable)
        .where(eq(candidateTable.id, cId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (c) candidates.push(c);
    }

    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    return submissions.map((s) => ({
      ...s,
      candidate: candidateMap.get(s.candidateId) || null,
    }));
  }

  async getSubmissionDetails(submissionId: Id<'assessmentSubmission'>) {
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

    if (!submission) return null;

    const candidate = await this.db
      .select()
      .from(candidateTable)
      .where(eq(candidateTable.id, submission.candidateId))
      .then((r) => (r.length > 0 ? r[0] : null));

    const questionSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(eq(questionSubmissionTable.submissionId, submissionId));

    // Get test case results for each question submission
    const questionSubmissionsWithResults = [];
    for (const qs of questionSubmissions) {
      const results = await this.db
        .select()
        .from(testCaseResultTable)
        .where(eq(testCaseResultTable.questionSubmissionId, qs.id));

      questionSubmissionsWithResults.push({
        ...qs,
        testCaseResults: results,
      });
    }

    return {
      ...submission,
      candidate,
      questionSubmissions: questionSubmissionsWithResults,
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

    // Update individual question scores if provided
    if (grades.questionScores) {
      for (const qs of grades.questionScores) {
        await this.db
          .update(questionSubmissionTable)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(questionSubmissionTable.id, qs.questionSubmissionId));
      }
    }

    return this.db
      .update(assessmentSubmissionTable)
      .set({
        status: 'graded',
        gradingNotes: grades.gradingNotes ?? submission.gradingNotes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);
  }
}
