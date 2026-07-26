import type { Id } from '@coderscreen/common/id';
import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './user.db';

// API keys for the public `/v1` API, owned by us (not the better-auth apiKey
// plugin). The org a key acts on behalf of is a real, indexed column so it can
// be filtered directly. Only the SHA-256 hash of the key is stored; the plaintext
// is shown once at creation time and never persisted.
export const apikey = pgTable(
  'apikey',
  {
    id: text('id').primaryKey().$type<Id<'apiKey'>>(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    // The member who created the key. Attribution only - the key acts for the
    // organization, not this user. Requests made with the key are attributed to
    // this user (e.g. as the creator of rooms opened via the API).
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name'),
    // e.g. "cs" - the human-readable prefix on the plaintext key.
    prefix: text('prefix'),
    // First few chars of the plaintext key, for display in the UI (e.g. "cs_ab12").
    start: text('start'),
    // SHA-256 hex digest of the full plaintext key. Lookups hash the incoming
    // key and match against this.
    keyHash: text('key_hash').notNull().unique(),
    enabled: boolean('enabled').default(true).notNull(),
    requestCount: integer('request_count').default(0).notNull(),
    lastRequest: timestamp('last_request', { mode: 'string', withTimezone: true }),
    expiresAt: timestamp('expires_at', { mode: 'string', withTimezone: true }),
  },
  (t) => [index('idx_apikey_org').on(t.organizationId)]
);

export type ApiKeyEntity = typeof apikey.$inferSelect;
