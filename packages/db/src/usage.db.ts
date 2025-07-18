// import {
//   pgTable,
//   text,
//   timestamp,
//   boolean,
//   integer,
//   uniqueIndex,
//   jsonb,
// } from 'drizzle-orm/pg-core';
// import { organization } from './user.db';
// import { Id } from '@coderscreen/common/id';

// export type EventType = 'live_interview' | 'team_members';

// export const eventTypesTable = pgTable('event_types', {
//   id: text('id').primaryKey().$type<EventType>(),
//   createdAt: timestamp('created_at', { mode: 'string' })
//     .$defaultFn(() => new Date().toISOString())
//     .notNull(),
//   name: text('name').notNull(),
//   description: text('description'),
//   doesReset: boolean('does_reset').notNull().default(true),
// });

// // Simplified usage tracking - combines limits and current usage
// export const eventUsageTable = pgTable(
//   'event_usage',
//   {
//     id: text('id').primaryKey().$type<Id<'usage'>>(),
//     createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
//     updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
//     organizationId: text('organization_id')
//       .notNull()
//       .references(() => organization.id, { onDelete: 'cascade' }),
//     eventType: text('event_type').notNull().$type<EventType>(),
//     count: integer('count').notNull().default(0),
//     limit: integer('limit').notNull(),
//     cycleStart: timestamp('cycle_start', { mode: 'string' }).notNull(),
//     cycleEnd: timestamp('cycle_end', { mode: 'string' }).notNull(),
//   },
//   (t) => [uniqueIndex('uq_usage_org_type_cycle').on(t.organizationId, t.eventType, t.cycleStart)]
// );

// // Optional: Simple event log for analytics (can be disabled if not needed)
// export const eventLogTable = pgTable('event_log', {
//   id: text('id').primaryKey().$type<Id<'eventLog'>>(),
//   createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
//   organizationId: text('organization_id')
//     .notNull()
//     .references(() => organization.id, { onDelete: 'cascade' }),
//   eventType: text('event_type').notNull().$type<EventType>(),
//   amount: integer('amount').notNull().default(1),
//   userId: text('user_id'),
//   resourceId: text('resource_id'),
//   metadata: jsonb('metadata'),
// });

// // Export types
// export type EventUsageEntity = typeof eventUsageTable.$inferSelect;
// export type EventLogEntity = typeof eventLogTable.$inferSelect;
