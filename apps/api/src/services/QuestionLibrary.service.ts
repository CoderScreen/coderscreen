import { generateId, Id } from '@coderscreen/common/id';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import { assessmentSubmissionTable } from '@coderscreen/db/assessmentSubmission.db';
import { questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import { questionLibraryTestCaseTable } from '@coderscreen/db/questionLibraryTestCase.db';
import { questionSubmissionTable } from '@coderscreen/db/questionSubmission.db';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import {
  CreateQuestionLibrarySchema,
  CreateQuestionLibraryTestCaseSchema,
  UpdateQuestionLibrarySchema,
  UpdateQuestionLibraryTestCaseSchema,
} from '@/schema/questionLibrary.zod';

export class QuestionLibraryService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
  }

  // === Question CRUD ===

  async listQuestions() {
    const { orgId } = getSession(this.ctx);

    const questions = await this.db
      .select()
      .from(questionLibraryTable)
      .where(eq(questionLibraryTable.organizationId, orgId))
      .orderBy(desc(questionLibraryTable.createdAt));

    if (questions.length === 0) return [];

    const libraryQuestionIds = questions.map((q) => q.id);

    // Per-(submission, libraryQuestion) best non-draft score ratio, restricted to
    // completed assessment submissions. Mirrors the "best non-draft submission"
    // semantics used at assessment submit time.
    const bestPerSubmission = this.db
      .select({
        libraryQuestionId: assessmentQuestionTable.questionId,
        submissionId: questionSubmissionTable.submissionId,
        bestRatio: sql<number>`MAX(
          CASE
            WHEN ${questionSubmissionTable.maxScore} > 0
            THEN ${questionSubmissionTable.score}::float / ${questionSubmissionTable.maxScore}
            ELSE 0
          END
        )`.as('best_ratio'),
      })
      .from(questionSubmissionTable)
      .innerJoin(
        assessmentQuestionTable,
        eq(questionSubmissionTable.questionId, assessmentQuestionTable.id)
      )
      .innerJoin(
        assessmentSubmissionTable,
        eq(questionSubmissionTable.submissionId, assessmentSubmissionTable.id)
      )
      .where(
        and(
          eq(questionSubmissionTable.isDraft, false),
          inArray(assessmentQuestionTable.questionId, libraryQuestionIds),
          inArray(assessmentSubmissionTable.status, ['submitted', 'graded'])
        )
      )
      .groupBy(assessmentQuestionTable.questionId, questionSubmissionTable.submissionId)
      .as('best_per_submission');

    const statsRows = await this.db
      .select({
        libraryQuestionId: bestPerSubmission.libraryQuestionId,
        timesTaken: sql<number>`COUNT(*)::int`.as('times_taken'),
        avgScore: sql<number | null>`AVG(${bestPerSubmission.bestRatio})`.as('avg_score'),
      })
      .from(bestPerSubmission)
      .groupBy(bestPerSubmission.libraryQuestionId);

    const statsByQuestion = new Map<string, { timesTaken: number; avgScore: number | null }>();
    for (const row of statsRows) {
      statsByQuestion.set(row.libraryQuestionId, {
        timesTaken: Number(row.timesTaken),
        avgScore: row.avgScore !== null ? Number(row.avgScore) : null,
      });
    }

    return questions.map((q) => {
      const stats = statsByQuestion.get(q.id);
      return {
        ...q,
        timesTaken: stats?.timesTaken ?? 0,
        avgScore: stats?.avgScore ?? null,
      };
    });
  }

  async getQuestion(id: Id<'questionLibrary'>) {
    const { orgId } = getSession(this.ctx);

    const question = await this.db
      .select()
      .from(questionLibraryTable)
      .where(
        and(
          eq(questionLibraryTable.id, id),
          eq(questionLibraryTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!question) return null;

    const testCases = await this.db
      .select()
      .from(questionLibraryTestCaseTable)
      .where(eq(questionLibraryTestCaseTable.questionId, id))
      .orderBy(asc(questionLibraryTestCaseTable.position));

    return {
      ...question,
      testCases,
    };
  }

  async createQuestion(values: CreateQuestionLibrarySchema) {
    const { user, orgId } = getSession(this.ctx);

    return this.db
      .insert(questionLibraryTable)
      .values({
        id: generateId('questionLibrary'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        createdByUserId: user.id,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateQuestion(id: Id<'questionLibrary'>, values: UpdateQuestionLibrarySchema) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(questionLibraryTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(questionLibraryTable.id, id),
          eq(questionLibraryTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }

  async deleteQuestion(id: Id<'questionLibrary'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .delete(questionLibraryTable)
      .where(
        and(
          eq(questionLibraryTable.id, id),
          eq(questionLibraryTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }

  // === Test Case CRUD ===

  async createTestCase(
    questionId: Id<'questionLibrary'>,
    values: CreateQuestionLibraryTestCaseSchema
  ) {
    return this.db
      .insert(questionLibraryTestCaseTable)
      .values({
        id: generateId('questionLibraryTestCase'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionId,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateTestCase(
    testCaseId: Id<'questionLibraryTestCase'>,
    values: UpdateQuestionLibraryTestCaseSchema
  ) {
    return this.db
      .update(questionLibraryTestCaseTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(questionLibraryTestCaseTable.id, testCaseId))
      .returning()
      .then((r) => r[0]);
  }

  async deleteTestCase(testCaseId: Id<'questionLibraryTestCase'>) {
    return this.db
      .delete(questionLibraryTestCaseTable)
      .where(eq(questionLibraryTestCaseTable.id, testCaseId))
      .returning()
      .then((r) => r[0]);
  }
}
