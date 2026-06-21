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
import { testCaseResultTable } from '@coderscreen/db/testCaseResult.db';
import { member, organization, user } from '@coderscreen/db/user.db';
import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import {
  ChangeLanguageSchema,
  CreateSubmissionSchema,
  GradeSubmissionSchema,
  SaveCodeSchema,
  StartAssessmentSchema,
} from '@/schema/assessment.zod';
import { resolveStarterCode } from '@/sandbox/harnesses';
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

    // Create questionSubmission rows for each assessment question link
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
        isDraft: true,
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
    const candidateIds = [...new Set(submissions.map((s) => s.candidateId))] as Id<'candidate'>[];
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
      candidate: candidateMap.get(s.candidateId) ?? null,
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
    let weightedTotal: number | null = null;
    let weightedMax: number | null = null;
    if (grades.questionScores) {
      // Apply manual score overrides to each question submission
      for (const qs of grades.questionScores) {
        await this.db
          .update(questionSubmissionTable)
          .set({ score: qs.score, updatedAt: new Date().toISOString() })
          .where(eq(questionSubmissionTable.id, qs.questionSubmissionId));
      }

      // Recompute weighted aggregate using the assessment-question points weights
      const aggregate = await this.computeWeightedAggregate(submissionId);
      weightedTotal = aggregate.totalScore;
      weightedMax = aggregate.maxScore;
    }

    return this.db
      .update(assessmentSubmissionTable)
      .set({
        status: 'graded',
        totalScore: weightedTotal ?? submission.totalScore,
        maxScore: weightedMax ?? submission.maxScore,
        gradingNotes: grades.gradingNotes ?? submission.gradingNotes,
        updatedAt: new Date().toISOString(),
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

    const assessmentQuestions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(eq(assessmentQuestionTable.assessmentId, submission.assessmentId as Id<'assessment'>));

    let weightedTotal = 0;
    let weightedMax = 0;

    for (const aq of assessmentQuestions) {
      weightedMax += aq.points;

      const bestSubmission = await this.db
        .select()
        .from(questionSubmissionTable)
        .where(
          and(
            eq(questionSubmissionTable.submissionId, submissionId),
            eq(questionSubmissionTable.questionId, aq.id),
            eq(questionSubmissionTable.isDraft, false)
          )
        )
        .orderBy(desc(questionSubmissionTable.score))
        .limit(1)
        .then((r) => (r.length > 0 ? r[0] : null));

      if (bestSubmission && bestSubmission.maxScore && bestSubmission.maxScore > 0) {
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
      .where(eq(assessmentQuestionTable.assessmentId, assessment.id))
      .orderBy(asc(assessmentQuestionTable.position));

    // Best non-draft submission per assessment question for this submission (highest score wins)
    const nonDraftSubmissions = await this.db
      .select()
      .from(questionSubmissionTable)
      .where(
        and(
          eq(questionSubmissionTable.submissionId, submission.id),
          eq(questionSubmissionTable.isDraft, false)
        )
      )
      .orderBy(desc(questionSubmissionTable.score));

    const bestByQuestionId = new Map<string, { score: number | null; maxScore: number | null }>();
    for (const qs of nonDraftSubmissions) {
      if (!bestByQuestionId.has(qs.questionId)) {
        bestByQuestionId.set(qs.questionId, { score: qs.score, maxScore: qs.maxScore });
      }
    }

    const questionsWithData = [];
    for (const r of rows) {
      // Only visible test cases for candidate
      const testCases = await this.db
        .select()
        .from(questionLibraryTestCaseTable)
        .where(
          and(
            eq(questionLibraryTestCaseTable.questionId, r.question.id),
            eq(questionLibraryTestCaseTable.isHidden, false)
          )
        )
        .orderBy(asc(questionLibraryTestCaseTable.position));

      const questionSubmission = await this.db
        .select()
        .from(questionSubmissionTable)
        .where(
          and(
            eq(questionSubmissionTable.submissionId, submission.id),
            eq(questionSubmissionTable.questionId, r.link.id)
          )
        )
        .then((rows) => (rows.length > 0 ? rows[0] : null));

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
        candidateEmail: candidate.email,
        candidateName: candidate.name,
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
        await tx.insert(testCaseResultTable).values(
          results.map((result) => ({
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
          }))
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

    this.ctx.executionCtx.waitUntil(this.notifyOrgOfSubmission(updated.id));

    return {
      ...updated,
      totalScore,
      maxScore,
    };
  }

  private async notifyOrgOfSubmission(submissionId: Id<'assessmentSubmission'>): Promise<void> {
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

      const recipients = await this.db
        .select({ email: user.email })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, submission.organizationId));

      if (recipients.length === 0) return;

      const viewLink = `${this.ctx.env.FE_APP_URL}/assessments/${assessment.id}/submissions`;
      const { resendService } = this.ctx.get('appFactory');

      await Promise.all(
        recipients.map((r) =>
          resendService
            .sendTransactionalEmail('assessment_submission', r.email, {
              org_name: org.name,
              candidate_name: candidate.name,
              candidate_email: candidate.email,
              assessment_title: assessment.title,
              score: submission.totalScore,
              max_score: submission.maxScore,
              submitted_at: submission.submittedAt ?? new Date().toISOString(),
              view_link: viewLink,
            })
            .catch((err) => {
              console.error('Failed to send assessment submission email', {
                recipient: r.email,
                submissionId,
                error: err,
              });
            })
        )
      );
    } catch (err) {
      console.error('Failed to dispatch assessment submission notifications', {
        submissionId,
        error: err,
      });
    }
  }
}
