import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentTestCaseTable } from './assessmentTestCase.db';
import { questionSubmissionTable } from './questionSubmission.db';
import { organization } from './user.db';

export const testCaseResultTable = pgTable('test_case_results', {
  id: text('id').primaryKey().$type<Id<'testCaseResult'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
  questionSubmissionId: text('question_submission_id')
    .notNull()
    .references(() => questionSubmissionTable.id, { onDelete: 'cascade' }),
  testCaseId: text('test_case_id')
    .notNull()
    .references(() => assessmentTestCaseTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  passed: boolean('passed').notNull(),
  actualOutput: text('actual_output').notNull().default(''),
  stderr: text('stderr').notNull().default(''),
  exitCode: integer('exit_code').notNull().default(0),
  executionTimeMs: integer('execution_time_ms'),
});

export type TestCaseResultEntity = typeof testCaseResultTable.$inferSelect;
