import { generateId, Id } from '@coderscreen/common/id';
import { AssessmentLanguage, assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import {
  AssessmentSubmissionEntity,
  assessmentSubmissionTable,
} from '@coderscreen/db/assessmentSubmission.db';
import { assessmentTestCaseTable } from '@coderscreen/db/assessmentTestCase.db';
import { CandidateEntity, candidateTable } from '@coderscreen/db/candidate.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { testCaseResultTable } from '@coderscreen/db/testCaseResult.db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import {
  CreateSubmissionSchema,
  GradeSubmissionSchema,
  SaveCodeSchema,
  StartAssessmentSchema,
} from '@/schema/assessment.zod';
import { AssessmentCodeRunService } from '@/services/AssessmentCodeRun.service';

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
      throw new HTTPException(400, {
        message: 'Assessment must be published before inviting candidates',
      });
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

  // === Candidate-Facing Methods (token-authenticated, no session required) ===

  async getSubmissionForToken(token: string): Promise<AssessmentSubmissionEntity | null> {
    return this.db
      .select()
      .from(assessmentSubmissionTable)
      .where(eq(assessmentSubmissionTable.accessToken, token))
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

    // Load questions with visible test cases + candidate's saved code
    const questions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(eq(assessmentQuestionTable.assessmentId, assessment.id))
      .orderBy(asc(assessmentQuestionTable.position));

    const questionsWithData = [];
    for (const q of questions) {
      const testCases = await this.db
        .select()
        .from(assessmentTestCaseTable)
        .where(
          and(
            eq(assessmentTestCaseTable.questionId, q.id),
            eq(assessmentTestCaseTable.isHidden, false)
          )
        )
        .orderBy(asc(assessmentTestCaseTable.position));

      const questionSubmission = await this.db
        .select()
        .from(questionSubmissionTable)
        .where(
          and(
            eq(questionSubmissionTable.submissionId, submission.id),
            eq(questionSubmissionTable.questionId, q.id)
          )
        )
        .then((r) => (r.length > 0 ? r[0] : null));

      questionsWithData.push({
        ...q,
        testCases,
        questionSubmission,
      });
    }

    return {
      submission: {
        id: submission.id,
        status: submission.status,
        selectedLanguage: submission.selectedLanguage,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        expiresAt: submission.expiresAt,
      },
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
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

    const updated = await this.db
      .update(questionSubmissionTable)
      .set({
        code: params.code,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(questionSubmissionTable.submissionId, submissionId),
          eq(questionSubmissionTable.questionId, params.questionId)
        )
      )
      .returning()
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!updated) {
      throw new HTTPException(404, { message: 'Question submission not found' });
    }

    return updated;
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
      await this.db
        .update(assessmentSubmissionTable)
        .set({
          status: 'expired',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(assessmentSubmissionTable.id, submissionId));
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

    // Get visible test cases for this question
    const testCases = await this.db
      .select()
      .from(assessmentTestCaseTable)
      .where(
        and(
          eq(assessmentTestCaseTable.questionId, params.questionId),
          eq(assessmentTestCaseTable.isHidden, false)
        )
      )
      .orderBy(asc(assessmentTestCaseTable.position));

    if (testCases.length === 0) {
      return { results: [] };
    }

    const codeRunService = new AssessmentCodeRunService(this.ctx);
    const results = await codeRunService.runTestCases({
      submissionId,
      code: params.code,
      language: submission.selectedLanguage as AssessmentLanguage,
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

    if (!submission.selectedLanguage) {
      throw new HTTPException(400, { message: 'No language selected' });
    }

    // Get all question submissions with their saved code
    const questionSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(eq(questionSubmissionTable.submissionId, submissionId));

    const codeRunService = new AssessmentCodeRunService(this.ctx);
    let totalPassed = 0;
    let totalTests = 0;

    for (const qs of questionSubmissions) {
      // Get ALL test cases (visible + hidden) for this question
      const testCases = await this.db
        .select()
        .from(assessmentTestCaseTable)
        .where(eq(assessmentTestCaseTable.questionId, qs.questionId))
        .orderBy(asc(assessmentTestCaseTable.position));

      if (testCases.length === 0) continue;

      // Run code against all test cases
      const results = await codeRunService.runTestCases({
        submissionId,
        code: qs.code,
        language: submission.selectedLanguage as AssessmentLanguage,
        testCases,
      });

      // Store results in testCaseResult table
      for (const result of results) {
        await this.db.insert(testCaseResultTable).values({
          id: generateId('testCaseResult'),
          createdAt: new Date().toISOString(),
          questionSubmissionId: qs.id,
          testCaseId: result.testCaseId,
          organizationId: submission.organizationId,
          passed: result.passed,
          actualOutput: result.actualOutput,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTimeMs: result.executionTimeMs,
        });

        totalTests++;
        if (result.passed) totalPassed++;
      }
    }

    // Update submission status
    const updated = await this.db
      .update(assessmentSubmissionTable)
      .set({
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        totalScore: totalPassed,
        maxScore: totalTests,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assessmentSubmissionTable.id, submissionId))
      .returning()
      .then((r) => r[0]);

    return {
      ...updated,
      totalPassed,
      totalTests,
    };
  }
}
