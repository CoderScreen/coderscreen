import { generateId, Id } from '@coderscreen/common/id';
import { questionLibraryTable } from '@coderscreen/db/questionLibrary.db';
import { questionLibraryTestCaseTable } from '@coderscreen/db/questionLibraryTestCase.db';
import { and, asc, desc, eq } from 'drizzle-orm';
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

    return this.db
      .select()
      .from(questionLibraryTable)
      .where(eq(questionLibraryTable.organizationId, orgId))
      .orderBy(desc(questionLibraryTable.createdAt));
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
