import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { organization } from './user.db';

export const candidateTable = pgTable(
  'candidates',
  {
    id: text('id').primaryKey().$type<Id<'candidate'>>(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`now()`).notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
  },
  (t) => [uniqueIndex('idx_candidate_org_email').on(t.organizationId, t.email)]
);

export type CandidateEntity = typeof candidateTable.$inferSelect;
