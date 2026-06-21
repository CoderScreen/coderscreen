import { generateId, Id } from '@coderscreen/common/id';
import type { Parameter, TypeString } from '@coderscreen/common/types';
import { assessmentTable } from '@coderscreen/db/assessment.db';
import { assessmentQuestionTable } from '@coderscreen/db/assessmentQuestion.db';
import { QuestionLibraryEntity, questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import {
  QuestionLibraryTestCaseEntity,
  questionLibraryTestCaseTable,
} from '@coderscreen/db/questionLibraryTestCase.db';
import { and, asc, count, eq, inArray, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { buildPaginatedResponse, PaginationQuery, paginateQuery } from '@/lib/pagination';
import { getSession } from '@/lib/session';
import {
  signatureChangesInvalidateTestCases,
  validateTestCaseShape,
} from '@/sandbox/validateTestCase';
import {
  CreateAssessmentSchema,
  CreateQuestionSchema,
  CreateTestCaseSchema,
  UpdateAssessmentSchema,
  UpdateQuestionSchema,
  UpdateTestCaseSchema,
} from '@/schema/assessment.zod';

export class AssessmentService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
  }

  // === Assessment CRUD ===

  async createAssessment(values: CreateAssessmentSchema) {
    const { user, orgId } = getSession(this.ctx);

    return this.db
      .insert(assessmentTable)
      .values({
        id: generateId('assessment'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        createdByUserId: user.id,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async getAssessment(id: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .select()
      .from(assessmentTable)
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));
  }

  async getAssessmentWithQuestions(id: Id<'assessment'>, pagination?: PaginationQuery) {
    const { orgId } = getSession(this.ctx);

    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) return null;

    // Build questions query with optional pagination
    let questionsQuery = this.db
      .select({
        link: assessmentQuestionTable,
        question: questionLibraryTable,
      })
      .from(assessmentQuestionTable)
      .innerJoin(
        questionLibraryTable,
        eq(assessmentQuestionTable.questionId, questionLibraryTable.id)
      )
      .where(eq(assessmentQuestionTable.assessmentId, id))
      .orderBy(asc(assessmentQuestionTable.position));

    let totalQuestions: number | undefined;

    if (pagination) {
      const { limit, offset } = paginateQuery(pagination);

      totalQuestions = await this.db
        .select({ count: count() })
        .from(assessmentQuestionTable)
        .where(eq(assessmentQuestionTable.assessmentId, id))
        .then((r) => r[0]?.count ?? 0);

      questionsQuery = questionsQuery.limit(limit).offset(offset) as typeof questionsQuery;
    }

    const rows = await questionsQuery;

    // Collect all library question IDs for test case lookup
    const libraryQuestionIds = rows.map((r) => r.question.id);

    // Fetch all test cases in a single query
    const testCases: QuestionLibraryTestCaseEntity[] =
      libraryQuestionIds.length > 0
        ? await this.db
            .select()
            .from(questionLibraryTestCaseTable)
            .where(inArray(questionLibraryTestCaseTable.questionId, libraryQuestionIds))
            .orderBy(asc(questionLibraryTestCaseTable.position))
        : [];

    // Group test cases by library question ID
    const testCasesByQuestion = new Map<string, QuestionLibraryTestCaseEntity[]>();
    for (const tc of testCases) {
      const existing = testCasesByQuestion.get(tc.questionId) || [];
      existing.push(tc);
      testCasesByQuestion.set(tc.questionId, existing);
    }

    const questions = rows.map((r) => ({
      id: r.link.id,
      createdAt: r.link.createdAt,
      updatedAt: r.link.updatedAt,
      assessmentId: r.link.assessmentId,
      organizationId: r.link.organizationId,
      questionId: r.question.id,
      position: r.link.position,
      points: r.link.points,
      title: r.question.title,
      description: r.question.description,
      functionName: r.question.functionName,
      parameters: r.question.parameters,
      returnType: r.question.returnType,
      starterCode: r.question.starterCode,
      timeLimitSeconds: r.question.timeLimitSeconds,
      testCases: testCasesByQuestion.get(r.question.id) || [],
    }));

    return {
      ...assessment,
      questions,
      ...(pagination && totalQuestions !== undefined
        ? {
            questionsPagination: {
              page: pagination.page,
              limit: pagination.limit,
              totalCount: totalQuestions,
              totalPages: Math.ceil(totalQuestions / pagination.limit),
            },
          }
        : {}),
    };
  }

  async listAssessments(pagination: PaginationQuery) {
    const { orgId } = getSession(this.ctx);
    const { limit, offset } = paginateQuery(pagination);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(assessmentTable)
        .where(eq(assessmentTable.organizationId, orgId))
        .orderBy(asc(assessmentTable.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(assessmentTable)
        .where(eq(assessmentTable.organizationId, orgId))
        .then((r) => r[0]?.count ?? 0),
    ]);

    return buildPaginatedResponse(data, countResult, pagination);
  }

  async updateAssessment(id: Id<'assessment'>, values: UpdateAssessmentSchema) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(assessmentTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .returning()
      .then((r) => r[0]);
  }

  async deleteAssessment(id: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .delete(assessmentTable)
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .returning()
      .then((r) => r[0]);
  }

  async publishAssessment(id: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    // Validate: at least 1 question with at least 1 test case
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
          eq(assessmentQuestionTable.assessmentId, id),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      );

    if (rows.length === 0) {
      throw new HTTPException(400, {
        message: 'Assessment must have at least one question before publishing',
      });
    }

    // Check each question has at least one test case (batch fetch)
    const questionIds = rows.map((r) => r.question.id);
    const allTestCases = await this.db
      .select()
      .from(questionLibraryTestCaseTable)
      .where(inArray(questionLibraryTestCaseTable.questionId, questionIds));

    const questionsWithTestCases = new Set(allTestCases.map((tc) => tc.questionId));

    for (const r of rows) {
      if (!questionsWithTestCases.has(r.question.id)) {
        throw new HTTPException(400, {
          message: `Question "${r.question.title}" must have at least one test case before publishing`,
        });
      }
    }

    return this.db
      .update(assessmentTable)
      .set({
        status: 'active',
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .returning()
      .then((r) => r[0]);
  }

  async archiveAssessment(id: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(assessmentTable)
      .set({
        status: 'archived',
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .returning()
      .then((r) => r[0]);
  }

  // === Question CRUD ===

  async createQuestion(assessmentId: Id<'assessment'>, values: CreateQuestionSchema) {
    const { user, orgId } = getSession(this.ctx);

    // Create library question
    const libraryQuestion = await this.db
      .insert(questionLibraryTable)
      .values({
        id: generateId('questionLibrary'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        createdByUserId: user.id,
        title: values.title,
        description: values.description,
        functionName: values.functionName,
        // zod-validated; cast narrows from `string` to literal types.
        parameters: values.parameters as Parameter[],
        returnType: values.returnType as TypeString,
        starterCode: values.starterCode,
        timeLimitSeconds: values.timeLimitSeconds ?? null,
      })
      .returning()
      .then((r) => r[0]);

    // Create link row
    const link = await this.db
      .insert(assessmentQuestionTable)
      .values({
        id: generateId('assessmentQuestion'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assessmentId,
        organizationId: orgId,
        questionId: libraryQuestion.id,
        position: values.position,
        points: values.points ?? 100,
      })
      .returning()
      .then((r) => r[0]);

    // Return flattened shape for API compatibility
    return {
      ...link,
      title: libraryQuestion.title,
      description: libraryQuestion.description,
      functionName: libraryQuestion.functionName,
      parameters: libraryQuestion.parameters,
      returnType: libraryQuestion.returnType,
      starterCode: libraryQuestion.starterCode,
      timeLimitSeconds: libraryQuestion.timeLimitSeconds,
    };
  }

  async linkExistingQuestion(
    assessmentId: Id<'assessment'>,
    values: {
      libraryQuestionId: Id<'questionLibrary'>;
      position: number;
      points?: number;
    }
  ) {
    const { orgId } = getSession(this.ctx);

    // Verify library question exists and belongs to this org
    const libraryQuestion = await this.db
      .select()
      .from(questionLibraryTable)
      .where(
        and(
          eq(questionLibraryTable.id, values.libraryQuestionId),
          eq(questionLibraryTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!libraryQuestion) {
      throw new HTTPException(404, { message: 'Library question not found' });
    }

    // Create link row
    const link = await this.db
      .insert(assessmentQuestionTable)
      .values({
        id: generateId('assessmentQuestion'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assessmentId,
        organizationId: orgId,
        questionId: libraryQuestion.id,
        position: values.position,
        points: values.points ?? 100,
      })
      .returning()
      .then((r) => r[0]);

    return {
      ...link,
      title: libraryQuestion.title,
      description: libraryQuestion.description,
      functionName: libraryQuestion.functionName,
      parameters: libraryQuestion.parameters,
      returnType: libraryQuestion.returnType,
      starterCode: libraryQuestion.starterCode,
      timeLimitSeconds: libraryQuestion.timeLimitSeconds,
    };
  }

  async updateQuestion(questionId: Id<'assessmentQuestion'>, values: UpdateQuestionSchema) {
    const { orgId } = getSession(this.ctx);

    // Get the link row to find library question
    const link = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(
        and(
          eq(assessmentQuestionTable.id, questionId),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!link) {
      throw new HTTPException(404, { message: 'Question not found' });
    }

    // Update link-level fields if changed
    const linkUpdates: Record<string, unknown> = {};
    if (values.position !== undefined) linkUpdates.position = values.position;
    if (values.points !== undefined) linkUpdates.points = values.points;
    if (Object.keys(linkUpdates).length > 0) {
      linkUpdates.updatedAt = new Date().toISOString();
      await this.db
        .update(assessmentQuestionTable)
        .set(linkUpdates)
        .where(eq(assessmentQuestionTable.id, questionId));
    }

    // Update content fields on library question
    const libraryUpdates: Record<string, unknown> = {};
    if (values.title !== undefined) libraryUpdates.title = values.title;
    if (values.description !== undefined) libraryUpdates.description = values.description;
    if (values.starterCode !== undefined) libraryUpdates.starterCode = values.starterCode;
    if (values.functionName !== undefined) libraryUpdates.functionName = values.functionName;
    if (values.parameters !== undefined)
      libraryUpdates.parameters = values.parameters as Parameter[];
    if (values.returnType !== undefined)
      libraryUpdates.returnType = values.returnType as TypeString;
    if (values.timeLimitSeconds !== undefined)
      libraryUpdates.timeLimitSeconds = values.timeLimitSeconds;

    // Detect signature change on the underlying library question. If the
    // signature has shifted, existing test cases are no longer valid (arg
    // count / types may not match) — delete them in the same transaction so
    // we never leave the question in a half-broken state.
    let libraryQuestion: QuestionLibraryEntity;
    if (Object.keys(libraryUpdates).length > 0) {
      libraryUpdates.updatedAt = new Date().toISOString();
      libraryQuestion = await this.db.transaction(async (tx) => {
        const current = await tx
          .select()
          .from(questionLibraryTable)
          .where(eq(questionLibraryTable.id, link.questionId as Id<'questionLibrary'>))
          .then((r) => (r.length > 0 ? r[0] : null));
        if (!current) {
          throw new HTTPException(404, { message: 'Library question not found' });
        }

        const nextSignature = {
          functionName: values.functionName ?? current.functionName,
          parameters: (values.parameters ?? current.parameters) as Parameter[],
          returnType: (values.returnType ?? current.returnType) as TypeString,
        };
        if (
          signatureChangesInvalidateTestCases(
            {
              functionName: current.functionName,
              parameters: current.parameters,
              returnType: current.returnType,
            },
            nextSignature
          )
        ) {
          await tx
            .delete(questionLibraryTestCaseTable)
            .where(
              eq(questionLibraryTestCaseTable.questionId, link.questionId as Id<'questionLibrary'>)
            );
        }

        const updated = await tx
          .update(questionLibraryTable)
          .set(libraryUpdates)
          .where(eq(questionLibraryTable.id, link.questionId as Id<'questionLibrary'>))
          .returning()
          .then((r) => r[0]);
        if (!updated) {
          throw new HTTPException(404, { message: 'Library question not found' });
        }
        return updated;
      });
    } else {
      const found = await this.db
        .select()
        .from(questionLibraryTable)
        .where(eq(questionLibraryTable.id, link.questionId as Id<'questionLibrary'>))
        .then((r) => r[0]);
      if (!found) throw new HTTPException(404, { message: 'Library question not found' });
      libraryQuestion = found;
    }

    // Re-fetch the link
    const updatedLink = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(eq(assessmentQuestionTable.id, questionId))
      .then((r) => r[0]);

    return {
      ...updatedLink,
      title: libraryQuestion.title,
      description: libraryQuestion.description,
      functionName: libraryQuestion.functionName,
      parameters: libraryQuestion.parameters,
      returnType: libraryQuestion.returnType,
      starterCode: libraryQuestion.starterCode,
      timeLimitSeconds: libraryQuestion.timeLimitSeconds,
    };
  }

  async deleteQuestion(questionId: Id<'assessmentQuestion'>) {
    const { orgId } = getSession(this.ctx);

    // Delete the link row. Library question survives for reuse.
    return this.db
      .delete(assessmentQuestionTable)
      .where(
        and(
          eq(assessmentQuestionTable.id, questionId),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }

  async reorderQuestions(
    assessmentId: Id<'assessment'>,
    order: Array<{ id: Id<'assessmentQuestion'>; position: number }>
  ) {
    if (order.length === 0) return;

    const { orgId } = getSession(this.ctx);
    const ids = order.map((item) => item.id);

    // Build CASE expression for batch update
    const positionCase = sql`CASE ${sql.join(
      order.map(
        (item) => sql`WHEN ${assessmentQuestionTable.id} = ${item.id} THEN ${item.position}`
      ),
      sql` `
    )} END`;

    await this.db
      .update(assessmentQuestionTable)
      .set({
        position: positionCase,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          inArray(assessmentQuestionTable.id, ids),
          eq(assessmentQuestionTable.assessmentId, assessmentId),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      );
  }

  // === Test Case CRUD (operates on questionLibraryTestCase) ===

  /**
   * Resolves an assessmentQuestion ID to its library question ID.
   */
  private async resolveLibraryQuestionId(
    assessmentQuestionId: Id<'assessmentQuestion'>
  ): Promise<Id<'questionLibrary'>> {
    const { orgId } = getSession(this.ctx);

    const link = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(
        and(
          eq(assessmentQuestionTable.id, assessmentQuestionId),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      )
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!link) {
      throw new HTTPException(404, { message: 'Question not found' });
    }

    return link.questionId as Id<'questionLibrary'>;
  }

  async createTestCase(
    assessmentQuestionId: Id<'assessmentQuestion'>,
    values: CreateTestCaseSchema
  ) {
    const libraryQuestionId = await this.resolveLibraryQuestionId(assessmentQuestionId);

    const question = await this.db
      .select()
      .from(questionLibraryTable)
      .where(eq(questionLibraryTable.id, libraryQuestionId))
      .then((r) => (r.length > 0 ? r[0] : null));
    if (!question) {
      throw new HTTPException(404, { message: 'Library question not found' });
    }
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
        questionId: libraryQuestionId,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateTestCase(testCaseId: Id<'questionLibraryTestCase'>, values: UpdateTestCaseSchema) {
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
      if (!question) throw new HTTPException(404, { message: 'Library question not found' });
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
