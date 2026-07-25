import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentTable } from './assessment.db';
import { questionLibraryTable } from './questionLibrary.db';
import { organization } from './user.db';

export const assessmentQuestionTable = pgTable(
  'assessment_questions',
  {
    id: text('id').primaryKey().$type<Id<'assessmentQuestion'>>(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    assessmentId: text('assessment_id')
      .notNull()
      .references(() => assessmentTable.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => questionLibraryTable.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    points: integer('points').notNull().default(100),
  },
  (t) => [
    index('idx_assessment_question_assessment').on(t.assessmentId),
    index('idx_assessment_question_question').on(t.questionId),
  ]
);

export type AssessmentQuestionEntity = typeof assessmentQuestionTable.$inferSelect;
