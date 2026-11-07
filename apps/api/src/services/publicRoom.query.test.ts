import type { Id } from '@coderscreen/common/id';
import { drizzle } from 'drizzle-orm/postgres-js';
import { describe, expect, it } from 'vitest';
import { buildPublicRoomQuery } from './publicRoom.query';

describe('buildPublicRoomQuery', () => {
  it('does not select private room fields', () => {
    const query = buildPublicRoomQuery(drizzle.mock(), 'r_test' as Id<'room'>).toSQL();

    expect(query.sql).toBe(
      'select "id", "organization_id", "created_at", "updated_at", "title", "language", "status" from "rooms" where "rooms"."id" = $1'
    );
    expect(query.params).toEqual(['r_test']);
  });
});
