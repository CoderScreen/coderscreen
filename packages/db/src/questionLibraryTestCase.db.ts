import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { questionLibraryTable } from './questionLibrary.db';

export const questionLibraryTestCaseTable = pgTable('question_library_test_cases', {
  id: text('id').primaryKey().$type<Id<'questionLibraryTestCase'>>(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  questionId: text('question_id')
    .notNull()
    .references(() => questionLibraryTable.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default(''),
  // Positional arg values, one entry per question parameter. JSON-shaped so
  // arrays/objects/null/primitives all round-trip. Validated against the
  // question's parameters[] at save time in the service layer.
  args: jsonb('args').$type<unknown[]>().notNull().default([]),
  expectedReturn: jsonb('expected_return').$type<unknown>().notNull().default(null),
  isHidden: boolean('is_hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
});

export type QuestionLibraryTestCaseEntity = typeof questionLibraryTestCaseTable.$inferSelect;
