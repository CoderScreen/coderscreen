import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentQuestionTable } from './assessmentQuestion.db';
import { organization } from './user.db';

export const assessmentTestCaseTable = pgTable('assessment_test_cases', {
  id: text('id').primaryKey().$type<Id<'assessmentTestCase'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`now()`).notNull(),
  questionId: text('question_id')
    .notNull()
    .references(() => assessmentQuestionTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default(''),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  isHidden: boolean('is_hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
});

export type AssessmentTestCaseEntity = typeof assessmentTestCaseTable.$inferSelect;
