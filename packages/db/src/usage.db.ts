import { pgTable, text, timestamp, integer, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';
import { organization } from './user.db';
import { Id } from '@coderscreen/common/id';

export type EventType = 'live_interview';

// TODO: figure out better way of tracking usage relative to a cycle

export const eventUsageTable = pgTable(
  'event_usage',
  {
    id: text('id').primaryKey().$type<Id<'eventUsage'>>(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull().$type<EventType>(),
    count: integer('count').notNull().default(0),
    limit: integer('limit').notNull(),
    cycleStart: timestamp('cycle_start', { mode: 'string' }).notNull(),
  },
  (t) => [uniqueIndex('uq_usage_org_type_cycle').on(t.organizationId, t.eventType, t.cycleStart)]
);

export const eventLogTable = pgTable('event_log', {
  id: text('id').primaryKey().$type<Id<'eventLog'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull().$type<EventType>(),
  amount: integer('amount').notNull().default(1),
  userId: text('user_id'),
  metadata: jsonb('metadata'),
});

// Export types
export type EventUsageEntity = typeof eventUsageTable.$inferSelect;
export type EventLogEntity = typeof eventLogTable.$inferSelect;
