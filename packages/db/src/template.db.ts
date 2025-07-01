import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';
import { RoomEntity } from './room.db';

export const templateTable = pgTable('templates', {
  id: text('id').primaryKey().$type<Id<'template'>>(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  language: text('language').$type<RoomEntity['language']>().notNull(),
  instructions: jsonb('instructions').notNull(),
});

export type TemplateEntity = typeof templateTable.$inferSelect;
