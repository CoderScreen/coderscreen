import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';
import { roomTable } from './room.db';

export const roomContentTable = pgTable('room_contents', {
  roomId: text('room_id')
    .primaryKey()
    .$type<Id<'room'>>()
    .references(() => roomTable.id, { onDelete: 'cascade' }),
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
  code: jsonb('code').notNull(),
  instructions: jsonb('instructions').notNull(),
  executionHistory: jsonb('execution_history').notNull(),
});

export type RoomContentEntity = typeof roomContentTable.$inferSelect;
