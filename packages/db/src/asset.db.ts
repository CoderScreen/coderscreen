import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user.db';

type AssetStatus = 'active' | 'deleted';

export const assetTable = pgTable('assets', {
  id: text('id').primaryKey().$type<Id<'asset'>>(),
  createdAt: timestamp('created_at', { mode: 'string' })
    .default(sql`now()`)
    .notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  key: text('key').notNull(),
  status: text('status').$type<AssetStatus>().notNull(),
});

export type AssetEntity = typeof assetTable.$inferSelect;
