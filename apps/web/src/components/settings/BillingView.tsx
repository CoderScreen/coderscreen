import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RiSettings3Line, RiQuestionLine } from '@remixicon/react';
import { cx } from '@/lib/utils';
import {
  useCustomer,
  usePlans,
  useCreateCheckoutSession,
  useCreatePortalSession,
} from '@/query/billing.query';
import { toast } from 'sonner';
import { BillingPlanCard } from './BillingPlanCard';
import { useMemo, useState } from 'react';
import { PlanSchema } from '@coderscreen/api/schema/billing';
import { useNavigate } from '@tanstack/react-router';
import { siteConfig } from '@/lib/siteConfig';

// Define Plan interface to match the actual data structure from the API
interface PlanEntity {
  id: string;
  name: string;
  price: string | null;
  interval: string | null;
  description: string | null;
  stripePriceId: string;
  group: string;
  isActive: boolean;
  createdAt: string;
}

// Common styling constants
const CARD_LIMIT_WARNING_STYLES = 'bg-red-50 border-red-200';
const USAGE_VALUE_STYLES = 'font-medium';
const USAGE_SUBTEXT_STYLES = 'text-xs text-muted-foreground';

export const BillingView = () => {
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const { plans: allPlans } = usePlans();
  const { createCheckoutSession, isLoading: isCreatingCheckout } = useCreateCheckoutSession();
  const { createPortalSession, isLoading: isCreatingPortal } = useCreatePortalSession();
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('monthly');

  const plans = useMemo(() => {
    return allPlans?.filter((plan) => plan.monthly?.price !== 0) ?? [];
  }, [allPlans]);

  // Get current plan from customer subscription
  const currentPlan = customer?.plan;

  console.log('currentPlan', currentPlan);

  const handleUpgrade = async (plan: PlanSchema) => {
    console.log('plan', plan);
    if (plan.id === 'p_enterprise') {
      await navigate({ to: siteConfig.externalRoutes.contactSales });
      return;
    }

    try {
      const checkoutSession = await createCheckoutSession({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutSession.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const handleManageBilling = async () => {
    try {
      const portalSession = await createPortalSession({
        returnUrl: `${window.location.origin}/settings/billing`,
      });

      // Redirect to Stripe Billing Portal
      window.location.href = portalSession.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open billing portal');
    }
  };
  const usageStats = {
    interviews: { used: 2, limit: 5 },
    teamSize: { used: 3, limit: 3 },
    workspaces: { used: 1, limit: 1 },
    codeExecutions: { used: 15, limit: 50 },
    apiRateLimit: '100 per minute',
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const isAtLimit = (used: number, limit: number) => {
    return used >= limit;
  };

  // Usage stat card component
  const UsageStatCard = ({
    label,
    value,
    subtext,
    used,
    limit,
    isAtLimit: atLimit = false,
  }: {
    label: string;
    value: string;
    subtext?: string;
    used: number;
    limit: number;
    isAtLimit?: boolean;
  }) => {
    return (
      <Card className={cx('h-full', atLimit && CARD_LIMIT_WARNING_STYLES)}>
        <CardHeader className='pb-0'>
          <MutedText>{label}</MutedText>
        </CardHeader>
        <CardContent className='flex items-center gap-2'>
          <p className={USAGE_VALUE_STYLES}>{value}</p>
          {subtext && <p className={USAGE_SUBTEXT_STYLES}>{subtext}</p>}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='min-h-screen flex flex-col p-4 max-w-7xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div className=''>
          <SmallHeader>Billing & Usage</SmallHeader>
          <MutedText>Manage your interview platform subscription and usage</MutedText>
        </div>

        <div className='flex items-center gap-4'>
          <Button variant='secondary' icon={RiQuestionLine} iconPosition='right'>
            Need Help
          </Button>
          <Button onClick={handleManageBilling} icon={RiSettings3Line} disabled={isCreatingPortal}>
            Manage Billing
          </Button>
        </div>
      </div>

      {/* Current Usage Details */}
      <div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <UsageStatCard
            label='Interviews (This Month)'
            value={`${usageStats.interviews.used} / ${usageStats.interviews.limit}`}
            used={usageStats.interviews.used}
            limit={usageStats.interviews.limit}
          />

          <UsageStatCard
            label='Team Members'
            value={`${usageStats.teamSize.used} / ${usageStats.teamSize.limit}`}
            used={usageStats.teamSize.used}
            limit={usageStats.teamSize.limit}
            isAtLimit={isAtLimit(usageStats.teamSize.used, usageStats.teamSize.limit)}
          />

          <UsageStatCard
            label='Workspaces'
            value={`${usageStats.workspaces.used} / ${usageStats.workspaces.limit}`}
            used={usageStats.workspaces.used}
            limit={usageStats.workspaces.limit}
            isAtLimit={isAtLimit(usageStats.workspaces.used, usageStats.workspaces.limit)}
          />

          <UsageStatCard
            label='Code Executions'
            value={`${usageStats.codeExecutions.used} / ${usageStats.codeExecutions.limit}`}
            used={usageStats.codeExecutions.used}
            limit={usageStats.codeExecutions.limit}
          />
        </div>
      </div>

      {/* Plan Switching Options */}
      <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
        <SmallHeader>Upgrade your plan</SmallHeader>

        <div className='flex items-center gap-2'>
          <Switch
            id='annual-discount'
            checked={billingMode === 'yearly'}
            onCheckedChange={(checked) => setBillingMode(checked ? 'yearly' : 'monthly')}
          />
          <label htmlFor='annual-discount' className='text-sm'>
            Annual Discount (two months free)
          </label>
        </div>
      </div>

      {/* Available Plans */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {!plans ? (
          <div className='col-span-full text-center py-8'>
            <MutedText>Loading plans...</MutedText>
          </div>
        ) : (
          <>
            {plans.map((plan, index) => (
              <BillingPlanCard
                key={plan.monthly?.id || plan.yearly?.id}
                monthly={plan.monthly}
                yearly={plan.yearly}
                mode={billingMode}
                currentPlanId={currentPlan?.id}
                onUpgrade={handleUpgrade}
                isCreatingCheckout={isCreatingCheckout}
                isPopular={index === Math.floor(plans.length / 2)}
              />
            ))}

            {/* Enterprise Plan - Always present */}
            <BillingPlanCard
              key='enterprise'
              monthly={{
                id: 'p_enterprise',
                name: 'Enterprise',
                description: 'For organizations with custom needs',
                price: -1,
                interval: 'monthly' as const,
                stripePriceId: 'contact_enterprise', // No Stripe price ID for enterprise
                features: undefined,
              }}
              yearly={null}
              mode='monthly'
              currentPlanId={currentPlan?.id}
              onUpgrade={handleUpgrade}
              isCreatingCheckout={isCreatingCheckout}
            />
          </>
        )}
      </div>
    </div>
  );
};
