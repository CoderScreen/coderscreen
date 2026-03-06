import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';

export type AssessmentMode = 'sequential' | 'independent';
export type AssessmentStatus = 'draft' | 'active' | 'archived';
export type AssessmentLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'bash'
  | 'rust'
  | 'c++'
  | 'c'
  | 'java'
  | 'go'
  | 'php'
  | 'ruby';

export const assessmentTable = pgTable('assessments', {
  id: text('id').primaryKey().$type<Id<'assessment'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`now()`).notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  mode: text('mode').$type<AssessmentMode>().notNull().default('independent'),
  status: text('status').$type<AssessmentStatus>().notNull().default('draft'),
  allowedLanguages: jsonb('allowed_languages')
    .$type<AssessmentLanguage[]>()
    .notNull()
    .default(['python', 'javascript', 'typescript']),
  timeLimitSeconds: integer('time_limit_seconds'),
});

export type AssessmentEntity = typeof assessmentTable.$inferSelect;
