import { Context } from 'hono';
import { AppContext } from '@/index';
import { useDb } from '@/db/client';
import {
  customerTable,
  PlanEntity,
  planTable,
  SubscriptionEntity,
  subscriptionTable,
} from '@coderscreen/db/billing.db';
import { eq, and } from 'drizzle-orm';
import { generateId, Id } from '@coderscreen/common/id';
import { Stripe } from 'stripe';
import { StripeService } from '@/services/third-party/Stripe.service';
import { getBilling } from '@/lib/session';

export class BillingService {
  private stripeService: StripeService;

  constructor(private readonly ctx: Context<AppContext>) {
    this.stripeService = new StripeService(this.ctx);
  }

  async createCustomerForOrganization(params: { organizationId: string; email: string }) {
    const { organizationId, email } = params;

    const db = useDb(this.ctx);

    // Create Stripe customer
    const stripeCustomer = await this.stripeService.createCustomer({
      name: `Org: ${organizationId}`,
      email,
      metadata: {
        organizationId,
      },
    });

    // Create customer record in database
    const customer = await db
      .insert(customerTable)
      .values({
        organizationId,
        stripeCustomerId: stripeCustomer.id,
        email,
      })
      .returning()
      .then((res) => res[0]);

    // assign free plan to customer by default
    await this.assignFreePlanToCustomer({ stripeCustomerId: stripeCustomer.id });

    return customer;
  }

  async assignFreePlanToCustomer(params: { stripeCustomerId: string }) {
    const { stripeCustomerId } = params;
    const freePlanId = this.ctx.env.FREE_PLAN_ID as Id<'plan'>;
    const db = useDb(this.ctx);

    const freePlan = await db
      .select()
      .from(planTable)
      .where(eq(planTable.id, freePlanId))
      .then((res) => res[0]);

    if (!freePlan) {
      throw new Error(`Free plan with id ${freePlanId} not found`);
    }

    await this.stripeService.createSubscription({
      customerId: stripeCustomerId,
      priceId: freePlan.stripePriceId,
    });
  }

  async createCheckoutSession(params: {
    organizationId: string;
    priceId: string;
    returnUrl: string;
  }) {
    const billing = await getBilling(this.ctx);

    if (!billing) {
      throw new Error('No active subscription found!');
    }

    return await this.stripeService.createCheckoutSession({
      subscription: billing.subscription,
      priceId: params.priceId,
      returnUrl: params.returnUrl,
    });
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return await this.stripeService.createBillingPortalSession(customerId, returnUrl);
  }

  async getCustomerByOrganizationId(organizationId: string) {
    const db = useDb(this.ctx);

    return await db
      .select()
      .from(customerTable)
      .where(eq(customerTable.organizationId, organizationId))
      .then((res) => (res.length > 0 ? res[0] : null));
  }

  async getActiveSubscription(organizationId: string) {
    const db = useDb(this.ctx);

    return await db
      .select({
        subscription: subscriptionTable,
        plan: planTable,
      })
      .from(customerTable)
      .innerJoin(
        subscriptionTable,
        eq(customerTable.stripeCustomerId, subscriptionTable.stripeCustomerId)
      )
      .innerJoin(planTable, eq(subscriptionTable.planId, planTable.id))
      .where(
        and(
          eq(customerTable.organizationId, organizationId),
          eq(subscriptionTable.status, 'active')
        )
      )
      .then((res) => (res.length > 0 ? res[0] : null));
  }

  async getPlans(): Promise<
    {
      group: 'free' | 'starter' | 'pro' | 'scale';
      monthly: PlanEntity | null;
      yearly: PlanEntity | null;
    }[]
  > {
    const db = useDb(this.ctx);

    const allPlans = await db
      .select()
      .from(planTable)
      .where(eq(planTable.isActive, true))
      .orderBy(planTable.price);

    const newMap = new Map<
      'free' | 'starter' | 'pro' | 'scale',
      {
        group: 'free' | 'starter' | 'pro' | 'scale';
        monthly: PlanEntity | null;
        yearly: PlanEntity | null;
      }
    >();

    allPlans.forEach((plan) => {
      const cur = newMap.get(plan.group as 'free' | 'starter' | 'pro' | 'scale') || {
        monthly: null,
        yearly: null,
      };
      if (plan.interval === 'monthly') {
        newMap.set(plan.group as 'free' | 'starter' | 'pro' | 'scale', {
          group: plan.group as 'free' | 'starter' | 'pro' | 'scale',
          monthly: plan,
          yearly: cur.yearly,
        });
      } else {
        newMap.set(plan.group as 'free' | 'starter' | 'pro' | 'scale', {
          group: plan.group as 'free' | 'starter' | 'pro' | 'scale',
          monthly: cur.monthly,
          yearly: plan,
        });
      }
    });

    return Array.from(newMap.values());
  }

  async getPlanByStripePriceId(stripePriceId: string) {
    const db = useDb(this.ctx);

    const plan = await db
      .select()
      .from(planTable)
      .where(eq(planTable.stripePriceId, stripePriceId))
      .then((res) => (res.length > 0 ? res[0] : null));

    if (!plan) {
      throw new Error(`Plan with stripe price id ${stripePriceId} not found`);
    }

    return plan;
  }

  // WEBHOOK STUFF
  async constructStripeEvent(signature: string, body: string) {
    return await this.stripeService.constructEvent({
      payload: body,
      signature,
    });
  }

  async upsertSubscriptionFromEvent(
    event:
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionCreatedEvent
      | Stripe.CustomerSubscriptionDeletedEvent
  ) {
    const db = useDb(this.ctx);
    const stripeSubscription = event.data.object;
    const stripeSubscriptionItem = stripeSubscription.items.data[0];

    if (!stripeSubscriptionItem) {
      throw new Error('Stripe subscription item not found in subscription update event');
    }

    const stripeCustomerId = (() => {
      if (typeof stripeSubscription.customer === 'string') {
        return stripeSubscription.customer;
      }
      return stripeSubscription.customer.id;
    })();

    // need to get associated plan from the stripe subscription
    const stripePriceId = stripeSubscriptionItem.price.id;

    const plan = await this.getPlanByStripePriceId(stripePriceId);

    const newSubscription: SubscriptionEntity = {
      id: generateId('subscription'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stripeCustomerId,
      planId: plan.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripeSubscriptionItemId: stripeSubscriptionItem.id,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(
        stripeSubscriptionItem.current_period_start * 1000
      ).toISOString(),
      currentPeriodEnd: new Date(stripeSubscriptionItem.current_period_end * 1000).toISOString(),
    };

    // Upsert local subscription
    const subscription = await db
      .insert(subscriptionTable)
      .values(newSubscription)
      .onConflictDoUpdate({
        target: [subscriptionTable.stripeSubscriptionId],
        set: {
          ...newSubscription,
          // remove fields that are not allowed to be updated
          id: undefined,
          createdAt: undefined,
        },
      })
      .returning()
      .then((res) => res[0]);

    return subscription;
  }
}
