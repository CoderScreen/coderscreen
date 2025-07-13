import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';

type RoomLanguage =
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
  notes: text('notes').notNull().default(''),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export type RoomEntity = typeof roomTable.$inferSelect;
