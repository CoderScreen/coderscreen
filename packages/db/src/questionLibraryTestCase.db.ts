import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { questionLibraryTable } from './questionLibrary.db';

export const questionLibraryTestCaseTable = pgTable('question_library_test_cases', {
  id: text('id').primaryKey().$type<Id<'questionLibraryTestCase'>>(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).default(sql`now()`).notNull(),
  questionId: text('question_id')
    .notNull()
    .references(() => questionLibraryTable.id, { onDelete: 'cascade' }),
  label: text('label').notNull().default(''),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  isHidden: boolean('is_hidden').notNull().default(false),
  position: integer('position').notNull().default(0),
});

export type QuestionLibraryTestCaseEntity = typeof questionLibraryTestCaseTable.$inferSelect;
