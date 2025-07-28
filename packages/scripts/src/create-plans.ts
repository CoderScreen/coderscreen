import { PlanEntity, planTable } from '@coderscreen/db/billing.db';
import { inArray } from 'drizzle-orm';
import { db } from './utils/db';

const PLANS_TO_CREATE: Pick<
  PlanEntity,
  | 'id'
  | 'name'
  | 'description'
  | 'price'
  | 'interval'
  | 'stripePriceId'
  | 'group'
  | 'isActive'
  | 'limits'
>[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Free plan',
    price: 0,
    interval: 'monthly',
    stripePriceId: 'price_1RpzOsPjZiImzsflOUsGIYYT',
    group: 'free',
    isActive: true,
    limits: {
      live_interview: 1,
      team_members: 1,
    },
  },
  {
    id: 'starter_monthly',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: 50,
    interval: 'monthly',
    stripePriceId: 'price_1RpzQ4PjZiImzsfle14vGxay',
    group: 'starter',
    isActive: true,
    limits: {
      live_interview: 10,
      team_members: 5,
    },
  },
  {
    id: 'starter_yearly',
    name: 'Starter (Yearly)',
    description: 'Perfect for small teams getting started',
    price: 500,
    interval: 'yearly',
    stripePriceId: 'price_1RpzQDPjZiImzsflrWeMBmgl',
    group: 'starter',
    isActive: true,
    limits: {
      live_interview: 10,
      team_members: 5,
    },
  },
  {
    id: 'scale_monthly',
    name: 'Scale',
    description: 'For growing teams and organizations',
    price: 350,
    interval: 'monthly',
    stripePriceId: 'price_1RpzX2PjZiImzsfliKobkQnw',
    group: 'scale',
    isActive: true,
    limits: {
      live_interview: 50,
      team_members: 25,
    },
  },
  {
    id: 'scale_yearly',
    name: 'Scale (Yearly)',
    description: 'For growing teams and organizations',
    price: 3500,
    interval: 'yearly',
    stripePriceId: 'price_1RpzX9PjZiImzsfljS9jzdwi',
    group: 'scale',
    isActive: true,
    limits: {
      live_interview: 50,
      team_members: 25,
    },
  },
];

async function main() {
  // fetch existing plans that match id of plans about to create
  const existingPlansIds = await db
    .select()
    .from(planTable)
    .where(
      inArray(
        planTable.id,
        PLANS_TO_CREATE.map((plan) => plan.id)
      )
    );

  if (existingPlansIds.length > 0) {
    console.log(
      'Certain plans already exist. Must be deleted or updated manually.',
      existingPlansIds.map((plan) => plan.id)
    );
    throw new Error('Plans already exist');
  }

  const liveMode: boolean = true; // change if we need new sandbox plans
  const toCreate: PlanEntity[] = PLANS_TO_CREATE.map((plan) => ({
    createdAt: new Date().toISOString(),
    liveMode,
    ...plan,
  }));

  await db.insert(planTable).values(toCreate);

  console.log(`Created plans:\n${toCreate.map((plan) => plan.id).join('\n')}`);
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
