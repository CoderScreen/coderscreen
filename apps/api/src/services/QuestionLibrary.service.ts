import { generateId, Id } from '@coderscreen/common/id';
import type { Parameter, TypeString } from '@coderscreen/common/types';
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
  signatureChangesInvalidateTestCases,
  validateTestCaseShape,
} from '@/sandbox/validateTestCase';
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
      .where(and(eq(questionLibraryTable.id, id), eq(questionLibraryTable.organizationId, orgId)))
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
        // zod-validated; cast narrows from `string` to `TypeString` literal.
        parameters: values.parameters as Parameter[],
        returnType: values.returnType as TypeString,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateQuestion(id: Id<'questionLibrary'>, values: UpdateQuestionLibrarySchema) {
    const { orgId } = getSession(this.ctx);

    // Detect signature change. If the function name, parameter list, or return
    // type changes, existing test cases no longer make sense (args may not
    // match new parameter count/types) — delete them in the same transaction
    // so we never leave a question with mismatched cases.
    const current = await this.db
      .select()
      .from(questionLibraryTable)
      .where(and(eq(questionLibraryTable.id, id), eq(questionLibraryTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));
    if (!current) {
      throw new HTTPException(404, { message: 'Question not found' });
    }

    const nextSignature = {
      functionName: values.functionName ?? current.functionName,
      parameters: (values.parameters ?? current.parameters) as Parameter[],
      returnType: (values.returnType ?? current.returnType) as TypeString,
    };
    const sigChanged = signatureChangesInvalidateTestCases(
      {
        functionName: current.functionName,
        parameters: current.parameters,
        returnType: current.returnType,
      },
      nextSignature
    );

    return this.db.transaction(async (tx) => {
      if (sigChanged) {
        await tx
          .delete(questionLibraryTestCaseTable)
          .where(eq(questionLibraryTestCaseTable.questionId, id));
      }
      const updated = await tx
        .update(questionLibraryTable)
        .set({
          ...values,
          // cast narrows from zod-validated string to literal types
          parameters: values.parameters ? (values.parameters as Parameter[]) : undefined,
          returnType: values.returnType ? (values.returnType as TypeString) : undefined,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(questionLibraryTable.id, id))
        .returning()
        .then((r) => r[0]);
      return updated;
    });
  }

  async deleteQuestion(id: Id<'questionLibrary'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .delete(questionLibraryTable)
      .where(and(eq(questionLibraryTable.id, id), eq(questionLibraryTable.organizationId, orgId)))
      .returning()
      .then((r) => r[0]);
  }

  // === Test Case CRUD ===

  async createTestCase(
    questionId: Id<'questionLibrary'>,
    values: CreateQuestionLibraryTestCaseSchema
  ) {
    const question = await this.db
      .select()
      .from(questionLibraryTable)
      .where(eq(questionLibraryTable.id, questionId))
      .then((r) => (r.length > 0 ? r[0] : null));
    if (!question) throw new HTTPException(404, { message: 'Question not found' });

    validateTestCaseShape(
      { parameters: question.parameters, returnType: question.returnType },
      values.args,
      values.expectedReturn
    );

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
    // If args/expectedReturn are being changed, re-validate against the parent
    // signature so the change can't accidentally invalidate the test case.
    if (values.args !== undefined || values.expectedReturn !== undefined) {
      const tc = await this.db
        .select()
        .from(questionLibraryTestCaseTable)
        .where(eq(questionLibraryTestCaseTable.id, testCaseId))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!tc) throw new HTTPException(404, { message: 'Test case not found' });
      const question = await this.db
        .select()
        .from(questionLibraryTable)
        .where(eq(questionLibraryTable.id, tc.questionId as Id<'questionLibrary'>))
        .then((r) => (r.length > 0 ? r[0] : null));
      if (!question) throw new HTTPException(404, { message: 'Question not found' });
      validateTestCaseShape(
        { parameters: question.parameters, returnType: question.returnType },
        values.args ?? tc.args,
        values.expectedReturn !== undefined ? values.expectedReturn : tc.expectedReturn
      );
    }

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
