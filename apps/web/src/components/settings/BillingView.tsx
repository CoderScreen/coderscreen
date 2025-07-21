import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiSettings3Line, RiQuestionLine } from '@remixicon/react';
import {
  useCustomer,
  usePlans,
  useCreateCheckoutSession,
  useCreatePortalSession,
  useAllUsage,
} from '@/query/billing.query';
import { toast } from 'sonner';
import { BillingPlanCard } from './BillingPlanCard';
import { useMemo, useState } from 'react';
import { PlanSchema } from '@coderscreen/api/schema/billing';
import { useNavigate } from '@tanstack/react-router';
import { siteConfig } from '@/lib/siteConfig';
import { UsageCard } from '@/components/settings/UsageCard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const BillingView = () => {
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const { plans: allPlans, isLoading: isLoadingPlans } = usePlans();
  const { createCheckoutSession, isLoading: isCreatingCheckout } = useCreateCheckoutSession();
  const { createPortalSession, isLoading: isCreatingPortal } = useCreatePortalSession();
  const { usage, isLoading } = useAllUsage();
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('yearly');

  const plans = useMemo(() => {
    return allPlans?.filter((plan) => plan.monthly?.price !== 0) ?? [];
  }, [allPlans]);

  // Get current plan from customer subscription
  const currentPlan = customer?.plan;
  const currentSubscription = customer?.subscription;

  // Format the resubscription date
  const formatResubscriptionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <div className='flex flex-col gap-4'>
        <div>
          <SmallHeader>Usage</SmallHeader>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {isLoading
            ? // Show 4 loading usage cards
              Array.from({ length: 4 }).map((_, index) => (
                <UsageCard key={`loading-usage-${index}`} isLoading={true} />
              ))
            : usage &&
              Object.entries(usage).map(([key, value]) => <UsageCard key={key} usage={value} />)}
        </div>
      </div>

      {/* Plan Switching Options */}
      <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
        <div>
          <SmallHeader>Upgrade your plan</SmallHeader>

          <MutedText>
            You are currently on the <b>{currentPlan?.name}</b> plan. Your next billing date is{' '}
            <b>{formatResubscriptionDate(currentSubscription?.currentPeriodEnd ?? '')}</b>.
          </MutedText>
        </div>

        <div className='flex items-center gap-2'>
          <ToggleGroup
            type='single'
            value={billingMode}
            onValueChange={(value) => {
              if (value && value !== '') {
                setBillingMode(value as 'monthly' | 'yearly');
              }
            }}
          >
            <ToggleGroupItem value='monthly'>Monthly</ToggleGroupItem>
            <ToggleGroupItem value='yearly'>
              Yearly
              <Badge variant='success' className='ml-2'>
                2 months free
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Available Plans */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {isLoadingPlans ? (
          Array.from({ length: 4 }).map((_, index) => (
            <BillingPlanCard
              group='free'
              key={`loading-plan-${index}`}
              monthly={null}
              yearly={null}
              mode={billingMode}
              isLoading={true}
            />
          ))
        ) : (
          <>
            {plans.map((plan, index) => (
              <BillingPlanCard
                group={plan.group}
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
              group='enterprise'
              monthly={{
                id: 'p_enterprise',
                name: 'Enterprise',
                description: 'For organizations with custom needs',
                price: -1,
                interval: 'monthly' as const,
                stripePriceId: 'contact_enterprise', // No Stripe price ID for enterprise
                limits: {
                  team_members: -1,
                  live_interview: -1,
                },
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
