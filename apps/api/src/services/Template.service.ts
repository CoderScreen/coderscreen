import { generateId, Id } from '@coderscreen/common/id';
import { TemplateEntity, templateTable } from '@coderscreen/db/template.db';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Context } from 'hono';
import { useDb } from '@/db/client';
import { AppContext } from '@/index';
import { getSession } from '@/lib/session';

export class TemplateService {
  private readonly db: PostgresJsDatabase;

  constructor(private readonly ctx: Context<AppContext>) {
    this.db = useDb(ctx);
  }

  async createTemplate(
    values: Omit<TemplateEntity, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'userId'>
  ) {
    const { user, orgId } = getSession(this.ctx);

    return this.db
      .insert(templateTable)
      .values({
        id: generateId('template'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: orgId,
        userId: user.id,
        ...values,
      })
      .returning()
      .then((t) => t[0]);
  }

  async getTemplate(id: Id<'template'>) {
    const { orgId } = getSession(this.ctx);
    return this.db
      .select()
      .from(templateTable)
      .where(and(eq(templateTable.id, id), eq(templateTable.organizationId, orgId)))
      .then((t) => t[0]);
  }

  async listTemplates() {
    const { orgId } = getSession(this.ctx);
    return this.db.select().from(templateTable).where(eq(templateTable.organizationId, orgId));
  }

  async updateTemplate(id: Id<'template'>, values: Partial<TemplateEntity>) {
    const { orgId } = getSession(this.ctx);

    return this.db
      .update(templateTable)
      .set(values)
      .where(and(eq(templateTable.id, id), eq(templateTable.organizationId, orgId)))
      .returning()
      .then((t) => t[0]);
  }

  async deleteTemplate(id: Id<'template'>) {
    const { orgId } = getSession(this.ctx);
    return this.db
      .delete(templateTable)
      .where(and(eq(templateTable.id, id), eq(templateTable.organizationId, orgId)))
      .returning()
      .then((t) => t[0]);
  }
}
