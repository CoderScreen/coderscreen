import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

type RoomLanguage = 'typescript' | 'javascript' | 'python' | 'rust' | 'c++';
type RoomStatus = 'active' | 'scheduled' | 'completed' | 'archived';

export const roomTable = pgTable('rooms', {
  id: text('id').primaryKey().$type<Id<'room'>>(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  language: text('language').$type<RoomLanguage>().notNull(),
  status: text('status').$type<RoomStatus>().notNull(),
});
