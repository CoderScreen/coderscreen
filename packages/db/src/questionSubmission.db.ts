import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentQuestionTable } from './assessmentQuestion.db';
import { assessmentSubmissionTable } from './assessmentSubmission.db';
import { organization } from './user.db';

export const questionSubmissionTable = pgTable('question_submissions', {
  id: text('id').primaryKey().$type<Id<'questionSubmission'>>(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => assessmentSubmissionTable.id, { onDelete: 'cascade' }),
  questionId: text('question_id')
    .notNull()
    .references(() => assessmentQuestionTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  code: text('code').notNull().default(''),
  language: text('language'),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  score: integer('score'),
  maxScore: integer('max_score'),
  isDraft: boolean('is_draft').notNull().default(true),
});

export type QuestionSubmissionEntity = typeof questionSubmissionTable.$inferSelect;
