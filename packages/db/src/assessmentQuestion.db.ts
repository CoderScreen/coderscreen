import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { assessmentTable } from './assessment.db';
import { organization } from './user.db';

export const assessmentQuestionTable = pgTable('assessment_questions', {
  id: text('id').primaryKey().$type<Id<'assessmentQuestion'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`now()`).notNull(),
  assessmentId: text('assessment_id')
    .notNull()
    .references(() => assessmentTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: jsonb('description').notNull(),
  position: integer('position').notNull(),
  timeLimitSeconds: integer('time_limit_seconds'),
  starterCode: text('starter_code').notNull().default(''),
});

export type AssessmentQuestionEntity = typeof assessmentQuestionTable.$inferSelect;
