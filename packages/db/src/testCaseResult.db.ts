import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { questionLibraryTestCaseTable } from './questionLibraryTestCase.db';
import { questionSubmissionTable } from './questionSubmission.db';
import { organization } from './user.db';

export type TestCaseFailureReason = 'passed' | 'compile' | 'timeout' | 'crash' | 'wrong_output';

export const testCaseResultTable = pgTable(
  'test_case_results',
  {
    id: text('id').primaryKey().$type<Id<'testCaseResult'>>(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    questionSubmissionId: text('question_submission_id')
      .notNull()
      .references(() => questionSubmissionTable.id, { onDelete: 'cascade' }),
    // Nulled when the test case is edited away (signature change, delete). The
    // snapshot columns below keep the result readable after that.
    testCaseId: text('test_case_id').references(() => questionLibraryTestCaseTable.id, {
      onDelete: 'set null',
    }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    passed: boolean('passed').notNull(),
    failureReason: text('failure_reason')
      .$type<TestCaseFailureReason>()
      .notNull()
      .default('passed'),
    actualOutput: text('actual_output').notNull().default(''),
    stderr: text('stderr').notNull().default(''),
    exitCode: integer('exit_code').notNull().default(0),
    executionTimeMs: integer('execution_time_ms'),
    // Snapshot of the test case as it was when this result was produced, so
    // later edits to the question can't rewrite or erase past results. Null on
    // rows written before snapshots existed; readers fall back to the live
    // test case for those.
    label: text('label'),
    args: jsonb('args').$type<unknown[]>(),
    expectedReturn: jsonb('expected_return').$type<unknown>(),
    isHidden: boolean('is_hidden'),
    position: integer('position'),
  },
  (t) => [index('idx_test_case_result_question_submission').on(t.questionSubmissionId)]
);

export type TestCaseResultEntity = typeof testCaseResultTable.$inferSelect;
