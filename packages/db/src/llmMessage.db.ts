import { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { roomTable } from './room.db';
import { organization } from './user.db';

type LLMRole = 'user' | 'assistant' | 'system';

export const llmMessageTable = pgTable('llm_messages', {
  id: text('id').primaryKey().$type<Id<'llmMessage'>>(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql`now()`).notNull(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  roomId: text('room_id')
    .notNull()
    .references(() => roomTable.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').notNull(),
  role: text('role').$type<LLMRole>().notNull(),
  content: text('content').notNull(),
  success: boolean('success').notNull(),
  metadata: jsonb('metadata').notNull(),
});

export type LLMMessageEntity = typeof llmMessageTable.$inferSelect;
