import { apikey } from '@coderscreen/db/user.db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { useAuth } from '@/lib/auth';
import { getSession } from '@/lib/session';

// Public-safe view of an API key. The secret is only ever returned once, at
// creation time.
const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  start: z.string().nullable(),
  prefix: z.string().nullable(),
  enabled: z.boolean(),
  requestCount: z.number(),
  lastRequest: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

const CreatedApiKeySchema = ApiKeySchema.extend({
  // Full plaintext key. Shown once and never retrievable again.
  key: z.string(),
});

const orgFilter = (orgId: string) => sql`${apikey.metadata}::jsonb ->> 'organizationId' = ${orgId}`;

const toSafe = (row: typeof apikey.$inferSelect) => ({
  id: row.id,
  name: row.name,
  start: row.start,
  prefix: row.prefix,
  enabled: row.enabled,
  requestCount: row.requestCount,
  lastRequest: row.lastRequest ? new Date(row.lastRequest).toISOString() : null,
  expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
  createdAt: new Date(row.createdAt).toISOString(),
});

export const apiKeyRouter = new Hono<AppContext>()
  // GET /api-keys - List API keys for the active organization
  .get(
    '/',
    describeRoute({
      description: 'List API keys for the active organization',
      responses: {
        200: {
          description: 'List of API keys',
          content: {
            'application/json': {
              schema: resolver(z.array(ApiKeySchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const { orgId } = getSession(ctx);
      const db = useDb(ctx);

      const rows = await db
        .select()
        .from(apikey)
        .where(orgFilter(orgId))
        .orderBy(desc(apikey.createdAt));

      return ctx.json(rows.map(toSafe));
    }
  )
  // POST /api-keys - Create a new API key for the active organization
  .post(
    '/',
    describeRoute({
      description: 'Create a new API key. The secret is only returned once.',
      responses: {
        201: {
          description: 'API key created',
          content: {
            'application/json': {
              schema: resolver(CreatedApiKeySchema),
            },
          },
        },
      },
    }),
    zValidator(
      'json',
      z.object({
        name: z.string().min(1).max(100),
        expiresInDays: z.number().int().positive().max(3650).optional(),
      })
    ),
    async (ctx) => {
      const { user, orgId } = getSession(ctx);
      const { name, expiresInDays } = ctx.req.valid('json');

      // apiKey plugin methods aren't on the widened useAuth return type; narrow
      // the surface we use.
      const api = useAuth(ctx).api as unknown as {
        createApiKey: (opts: {
          body: {
            name: string;
            prefix?: string;
            userId: string;
            expiresIn?: number;
            metadata?: Record<string, unknown>;
          };
        }) => Promise<typeof apikey.$inferSelect & { key: string }>;
      };

      const created = await api.createApiKey({
        body: {
          name,
          prefix: 'cs',
          userId: user.id,
          expiresIn: expiresInDays ? expiresInDays * 24 * 60 * 60 : undefined,
          metadata: {
            organizationId: orgId,
            createdByUserId: user.id,
          },
        },
      });

      return ctx.json(
        {
          ...toSafe(created),
          key: created.key,
        },
        201
      );
    }
  )
  // DELETE /api-keys/:id - Revoke an API key
  .delete(
    '/:id',
    describeRoute({
      description: 'Revoke an API key',
      responses: {
        200: {
          description: 'API key revoked',
        },
        404: {
          description: 'API key not found',
        },
      },
    }),
    zValidator('param', z.object({ id: z.string() })),
    async (ctx) => {
      const { orgId } = getSession(ctx);
      const { id } = ctx.req.valid('param');
      const db = useDb(ctx);

      // Scope the delete to the active org so members can only revoke their own
      // organization's keys, regardless of which member created them.
      const existing = await db
        .select({ id: apikey.id })
        .from(apikey)
        .where(and(eq(apikey.id, id), orgFilter(orgId)))
        .then((r) => (r.length > 0 ? r[0] : null));

      if (!existing) {
        throw new HTTPException(404, { message: 'API key not found' });
      }

      await db.delete(apikey).where(eq(apikey.id, id));

      return ctx.json(null, 200);
    }
  );
