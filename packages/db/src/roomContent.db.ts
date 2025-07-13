import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';
import { RoomEntity, roomTable } from './room.db';

type TrackerUsers = {
  id: string;
  name: string;
  email: string;
  color: string;
}[];

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
  status: text('status').$type<RoomEntity['status']>().notNull().default('active'),
  code: jsonb('code').notNull(),
  language: text('language').notNull(),
  instructions: jsonb('instructions').notNull(),
  executionHistory: jsonb('execution_history').notNull(),
  trackedUsers: jsonb('tracked_users').$type<TrackerUsers>().notNull().default([]),
  rawContent: text('raw_content').notNull(),
  rawPrivateContent: text('raw_private_content').notNull(),
});

export type RoomContentEntity = typeof roomContentTable.$inferSelect;
