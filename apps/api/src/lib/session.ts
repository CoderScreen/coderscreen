import { Context } from 'hono';
import { AppContext } from '../index';
import { BillingService } from '@/services/billing/Billing.service';
import { PlanEntity, SubscriptionEntity } from '@coderscreen/db/billing.db';
import { HTTPException } from 'hono/http-exception';

export const getSession = (ctx: Context<AppContext>, options?: { noActiveOrg?: boolean }) => {
  const user = ctx.get('user');
  const session = ctx.get('session');

  if (!user) {
    throw new Error('User not found in context');
  }

  if (!session) {
    throw new Error('Session not found in context');
  }

  if (!session.activeOrganizationId && !options?.noActiveOrg) {
    throw new Error('Active organization not found in session');
  }

  return {
    user,
    session,
    orgId: session.activeOrganizationId!,
  };
};

/**
 * Fetches and caches billing data for the current organization
 */
export const getBilling = async (
  ctx: Context<AppContext>
): Promise<{
  subscription: SubscriptionEntity;
  plan: PlanEntity;
}> => {
  const local = ctx.get('subscription');
  if (local) {
    return local;
  }

  const { orgId } = getSession(ctx);
  const billingService = new BillingService(ctx);

  const result = await billingService.getActiveSubscription(orgId);

  if (!result) {
    throw new HTTPException(500, {
      message: 'No active subscription found',
    });
  }

  ctx.set('subscription', result);
  return result;
};
