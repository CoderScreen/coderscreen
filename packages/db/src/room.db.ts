import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const roomLanguageEnum = pgEnum('room_language', [
  'javascript',
  'python',
  'typescript',
]);

export const roomTable = pgTable('rooms', {
  id: text('id').primaryKey().$type<Id<'room'>>(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  language: roomLanguageEnum('language').notNull(),
});
