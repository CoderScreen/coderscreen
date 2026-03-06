import { generateId, Id } from '@coderscreen/common/id';
import { assessmentTable } from '@coderscreen/db/assessment.db';
import {
  AssessmentQuestionEntity,
  assessmentQuestionTable,
} from '@coderscreen/db/assessmentQuestion.db';
import {
  AssessmentTestCaseEntity,
  assessmentTestCaseTable,
} from '@coderscreen/db/assessmentTestCase.db';
import { and, asc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';
import { CreateAssessmentSchema, UpdateAssessmentSchema } from '@/schema/assessment.zod';

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

  async getAssessmentWithQuestions(id: Id<'assessment'>) {
    const { orgId } = getSession(this.ctx);

    const assessment = await this.db
      .select()
      .from(assessmentTable)
      .where(and(eq(assessmentTable.id, id), eq(assessmentTable.organizationId, orgId)))
      .then((r) => (r.length > 0 ? r[0] : null));

    if (!assessment) return null;

    const questions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(eq(assessmentQuestionTable.assessmentId, id))
      .orderBy(asc(assessmentQuestionTable.position));

    const testCases: AssessmentTestCaseEntity[] = [];
    for (const q of questions) {
      const qTestCases = await this.db
        .select()
        .from(assessmentTestCaseTable)
        .where(eq(assessmentTestCaseTable.questionId, q.id))
        .orderBy(asc(assessmentTestCaseTable.position));
      testCases.push(...qTestCases);
    }

    // Group test cases by question
    const testCasesByQuestion = new Map<string, AssessmentTestCaseEntity[]>();
    for (const tc of testCases) {
      const existing = testCasesByQuestion.get(tc.questionId) || [];
      existing.push(tc);
      testCasesByQuestion.set(tc.questionId, existing);
    }

    return {
      ...assessment,
      questions: questions.map((q) => ({
        ...q,
        testCases: testCasesByQuestion.get(q.id) || [],
      })),
    };
  }

  async listAssessments() {
    const { orgId } = getSession(this.ctx);

    return this.db
      .select()
      .from(assessmentTable)
      .where(eq(assessmentTable.organizationId, orgId))
      .orderBy(asc(assessmentTable.createdAt));
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
    const questions = await this.db
      .select()
      .from(assessmentQuestionTable)
      .where(
        and(
          eq(assessmentQuestionTable.assessmentId, id),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      );

    if (questions.length === 0) {
      throw new HTTPException(400, {
        message: 'Assessment must have at least one question before publishing',
      });
    }

    // Check each question has at least one test case
    for (const q of questions) {
      const testCases = await this.db
        .select()
        .from(assessmentTestCaseTable)
        .where(eq(assessmentTestCaseTable.questionId, q.id));

      if (testCases.length === 0) {
        throw new HTTPException(400, {
          message: `Question "${q.title}" must have at least one test case before publishing`,
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

  async createQuestion(
    assessmentId: Id<'assessment'>,
    values: Omit<
      AssessmentQuestionEntity,
      'id' | 'createdAt' | 'updatedAt' | 'assessmentId' | 'organizationId'
    >
  ) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .insert(assessmentQuestionTable)
      .values({
        id: generateId('assessmentQuestion'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assessmentId,
        organizationId: orgId,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateQuestion(
    questionId: Id<'assessmentQuestion'>,
    values: Partial<AssessmentQuestionEntity>
  ) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(assessmentQuestionTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(assessmentQuestionTable.id, questionId),
          eq(assessmentQuestionTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }

  async deleteQuestion(questionId: Id<'assessmentQuestion'>) {
    const { orgId } = getSession(this.ctx);

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
    const { orgId } = getSession(this.ctx);

    for (const item of order) {
      await this.db
        .update(assessmentQuestionTable)
        .set({
          position: item.position,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(assessmentQuestionTable.id, item.id),
            eq(assessmentQuestionTable.assessmentId, assessmentId),
            eq(assessmentQuestionTable.organizationId, orgId)
          )
        );
    }
  }

  // === Test Case CRUD ===

  async createTestCase(
    questionId: Id<'assessmentQuestion'>,
    values: Omit<
      AssessmentTestCaseEntity,
      'id' | 'createdAt' | 'updatedAt' | 'questionId' | 'organizationId'
    >
  ) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .insert(assessmentTestCaseTable)
      .values({
        id: generateId('assessmentTestCase'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionId,
        organizationId: orgId,
        ...values,
      })
      .returning()
      .then((r) => r[0]);
  }

  async updateTestCase(
    testCaseId: Id<'assessmentTestCase'>,
    values: Partial<AssessmentTestCaseEntity>
  ) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(assessmentTestCaseTable)
      .set({
        ...values,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(assessmentTestCaseTable.id, testCaseId),
          eq(assessmentTestCaseTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }

  async deleteTestCase(testCaseId: Id<'assessmentTestCase'>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .delete(assessmentTestCaseTable)
      .where(
        and(
          eq(assessmentTestCaseTable.id, testCaseId),
          eq(assessmentTestCaseTable.organizationId, orgId)
        )
      )
      .returning()
      .then((r) => r[0]);
  }
}
