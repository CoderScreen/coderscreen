import type { Id } from '@coderscreen/common/id';
import type { Parameter, TypeString } from '@coderscreen/common/types';
import { sql } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { AssessmentLanguage } from './assessment.db';
import { organization, user } from './user.db';

export const questionLibraryTable = pgTable('question_library', {
  id: text('id').primaryKey().$type<Id<'questionLibrary'>>(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  organizationId: text('organization_id').references(() => organization.id, {
    onDelete: 'cascade',
  }),
  createdByUserId: text('created_by_user_id').references(() => user.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: jsonb('description').notNull(),
  functionName: text('function_name').notNull().default(''),
  parameters: jsonb('parameters').$type<Parameter[]>().notNull().default([]),
  returnType: text('return_type').$type<TypeString>().notNull().default('null'),
  starterCode: jsonb('starter_code')
    .$type<Partial<Record<AssessmentLanguage, string>>>()
    .notNull()
    .default({}),
  timeLimitSeconds: integer('time_limit_seconds'),
  isPublic: boolean('is_public').notNull().default(false),
});

export type QuestionLibraryEntity = typeof questionLibraryTable.$inferSelect;
