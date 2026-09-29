import { planTable } from '@coderscreen/db/billing.db';
import { eventUsageTable } from '@coderscreen/db/usage.db';
import { and, eq, sql } from 'drizzle-orm';
import { db } from './utils/db';

/**
 * Adds `assessment_invite` limits to all plans (yearly = 12x monthly) and syncs
 * usage rows created as unlimited before the plan had a limit.
 * Dry run by default: bun run src/add-assessment-invite-limits.ts --apply
 */

const MONTHLY_ASSESSMENT_INVITES: Record<string, number> = {
  free: 5,
  starter: 25,
  scale: 150,
};

const apply = process.argv.includes('--apply');

async function main() {
  const plans = await db.select().from(planTable);

  for (const plan of plans) {
    const monthly = MONTHLY_ASSESSMENT_INVITES[plan.group];
    if (monthly === undefined) {
      console.log(`- ${plan.id}: unknown group "${plan.group}", skipping`);
      continue;
    }

    const limit = plan.interval === 'yearly' ? monthly * 12 : monthly;
    const current = plan.limits.assessment_invite;
    console.log(`- ${plan.id}: assessment_invite ${current ?? '(none)'} -> ${limit}`);

    if (apply && current !== limit) {
      await db
        .update(planTable)
        .set({ limits: { ...plan.limits, assessment_invite: limit } })
        .where(eq(planTable.id, plan.id));
    }
  }

  // Point rows stored as unlimited at the org's current plan limit
  const syncQuery = sql`
    UPDATE ${eventUsageTable} eu
    SET "limit" = (p.limits->>'assessment_invite')::int, updated_at = now()
    FROM customers c
    JOIN subscriptions s ON s.stripe_customer_id = c.stripe_customer_id AND s.status = 'active'
    JOIN plans p ON p.id = s.plan_id
    WHERE eu.organization_id = c.organization_id
      AND eu.event_type = 'assessment_invite'
      AND eu."limit" = -1
      AND p.limits ? 'assessment_invite'
  `;

  const unlimitedRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventUsageTable)
    .where(and(eq(eventUsageTable.eventType, 'assessment_invite'), eq(eventUsageTable.limit, -1)))
    .then((res) => res[0].count);

  console.log(`- ${unlimitedRows} assessment_invite usage rows stored as unlimited`);

  if (apply && unlimitedRows > 0) {
    await db.execute(syncQuery);
    console.log('  synced to plan limits');
  }

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write these changes.');
  }
}

main()
  .then(() => {
    console.log('✅ Finished running script');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error running script', err);
    process.exit(1);
  });
