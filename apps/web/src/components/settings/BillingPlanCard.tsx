import { PlanSchema } from '@coderscreen/api/schema/billing';
import {
  RemixiconComponentType,
  RiArrowRightLine,
  RiBaseStationLine,
  RiCustomerServiceLine,
  RiGlobalLine,
  RiHistoryLine,
  RiLockPasswordLine,
  RiPaletteLine,
  RiStarLine,
  RiSwap2Line,
  RiTeamLine,
  RiTerminalWindowFill,
} from '@remixicon/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cx } from '@/lib/utils';

const LIMIT_MAP = {
  live_interview: {
    icon: RiTerminalWindowFill,
    label: 'Live Interviews',
    renews: true,
  },
  team_members: {
    icon: RiTeamLine,
    label: 'Team Members',
    renews: false,
  },
} satisfies Record<
  keyof PlanSchema['limits'],
  {
    icon: RemixiconComponentType;
    label: string;
    renews: boolean;
  }
>;

// Feature mapping for each plan
const PLAN_FEATURE_MAP: Record<
  'free' | 'starter' | 'scale' | 'enterprise',
  Array<{
    icon: RemixiconComponentType;
    label: string;
    subText?: string;
  }>
> = {
  free: [
    {
      icon: RiHistoryLine,
      label: 'Interview Playback',
      subText: `Replay interviews to review every step of a candidate's coding process`,
    },
    { icon: RiCustomerServiceLine, label: 'Community Support' },
  ],
  starter: [
    {
      icon: RiHistoryLine,
      label: 'Interview Playback',
      subText: `Replay interviews to review every step of a candidate's coding process`,
    },
    {
      icon: RiGlobalLine,
      label: 'Advanced Interviews',
      subText: 'Multi-file & framework support. (React, Next.js, etc.)',
    },
    {
      icon: RiBaseStationLine,
      label: 'API Access',
      subText: 'Access to our API for custom integrations',
    },
    {
      icon: RiCustomerServiceLine,
      label: 'Basic Support',
    },
  ],
  scale: [
    {
      icon: RiHistoryLine,
      label: 'Interview Playback',
      subText: `Replay interviews to review every step of a candidate's coding process`,
    },
    {
      icon: RiGlobalLine,
      label: 'Advanced Interviews',
      subText: 'Multi-file & framework support. (React, Next.js, etc.)',
    },
    {
      icon: RiBaseStationLine,
      label: 'API Access',
      subText: 'Access to our API for custom integrations',
    },
    {
      icon: RiSwap2Line,
      label: 'ATS Integrations',
      subText: 'Greenhouse, Lever, Ashby, etc.',
    },
    {
      icon: RiPaletteLine,
      label: 'Custom Branding and Domains',
      subText: 'Enhance your interview experience with your own branding',
    },
    {
      icon: RiCustomerServiceLine,
      label: 'Dedicated Support',
    },
  ],
  enterprise: [
    {
      icon: RiHistoryLine,
      label: 'Interview Playback',
      subText: `Replay interviews to review every step of a candidate's coding process`,
    },
    {
      icon: RiGlobalLine,
      label: 'Advanced Interviews',
      subText: 'Multi-file & framework support. (React, Next.js, etc.)',
    },
    {
      icon: RiBaseStationLine,
      label: 'API Access',
      subText: 'Access to our API for custom integrations',
    },
    {
      icon: RiSwap2Line,
      label: 'ATS Integrations',
      subText: 'Greenhouse, Lever, Ashby, etc.',
    },
    {
      icon: RiPaletteLine,
      label: 'Custom Branding and Domains',
      subText: 'Enhance your interview experience with your own branding',
    },
    {
      icon: RiLockPasswordLine,
      label: 'Single Sign-On (SSO)',
    },
    {
      icon: RiCustomerServiceLine,
      label: 'Whiteglove Support',
    },
  ],
};

export const BillingPlanCard = ({
  group,
  monthly,
  yearly,
  mode,
  currentPlanId,
  isPopular = false,
  onUpgrade,
  isCreatingCheckout = false,
  isLoading = false,
}: {
  group: 'free' | 'starter' | 'scale' | 'enterprise';
  monthly: PlanSchema | null;
  yearly: PlanSchema | null;
  mode: PlanSchema['interval'];
  currentPlanId?: string;
  isPopular?: boolean;
  onUpgrade?: (plan: PlanSchema) => void;
  isCreatingCheckout?: boolean;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className='relative transition-all duration-200 flex flex-col'>
        <CardHeader>
          <Skeleton className='h-6 w-32 mb-2' />
          <Skeleton className='h-4 w-48 mb-4' />
          <Skeleton className='h-8 w-20' />
        </CardHeader>
        <CardContent className='flex-1'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='w-6 h-6 rounded' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='w-6 h-6 rounded' />
              <Skeleton className='h-4 w-36' />
            </div>
          </div>
        </CardContent>
        <CardFooter className='mt-auto'>
          <Skeleton className='h-10 w-full' />
        </CardFooter>
      </Card>
    );
  }

  // Select the plan based on mode, fallback to the other if the preferred one is null
  const plan = mode === 'monthly' ? monthly || yearly : yearly || monthly;
  const isYearly = mode === 'yearly';

  const isCurrentPlan = currentPlanId === plan?.id;

  // If no plan is available or is free plan, don't render anything
  if (!plan) {
    return null;
  }

  return (
    <Card
      key={plan.id}
      className={cx(
        'relative transition-all duration-200 flex flex-col',
        isPopular ? 'ring-2 ring-primary shadow-lg' : ''
        // isCurrentPlan ? 'bg-green-500/10 border-green-500/20' : ''
      )}
    >
      {isPopular && (
        <Badge className='absolute top-4 right-4 bg-primary text-white'>
          <RiStarLine className='w-3 h-3' />
          Most Popular
        </Badge>
      )}

      <CardHeader>
        <CardTitle className='text-lg'>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className='text-2xl'>
          {plan.name === 'Enterprise' ? (
            'Custom'
          ) : plan.price === 0 ? (
            'Free'
          ) : (
            <span>${plan.price}</span>
          )}

          {plan.price > 0 && plan.name !== 'Enterprise' ? (
            <>
              <span className='text-sm font-normal text-muted-foreground ml-1'>
                per {plan.interval === 'monthly' ? 'month' : 'year'}
              </span>
              {isYearly && (
                <Badge className='ml-2' variant='success'>
                  2 months free
                </Badge>
              )}
            </>
          ) : null}
        </div>

        <Button
          className={cx(
            'my-4',
            isCurrentPlan ? 'disabled:text-primary/50 disabled:border-primary/50' : ''
          )}
          variant={isPopular ? 'primary' : 'secondary'}
          icon={RiArrowRightLine}
          iconPosition='right'
          onClick={() => plan && onUpgrade?.(plan)}
          isLoading={isCreatingCheckout}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan
            ? 'Current Plan'
            : plan.name === 'Enterprise'
              ? 'Contact Sales'
              : 'Select Plan'}
        </Button>
      </CardHeader>

      <CardContent className='flex-1'>
        <ul className='space-y-4'>
          {Object.entries(LIMIT_MAP).map(([key, { icon: IconComponent, label, renews }]) => {
            const rawValue = plan.limits[key as keyof PlanSchema['limits']];
            const value = rawValue === -1 ? 'Custom' : rawValue;

            return (
              <li key={key} className={cx('flex gap-2', renews ? 'items-start' : 'items-center')}>
                <div className='p-1'>
                  <IconComponent className='w-4 h-4 text-muted-foreground' />
                </div>
                <div className='flex-1 flex flex-col justify-center'>
                  <span className='text-sm font-medium'>
                    {value} {label}
                  </span>
                  {renews && rawValue !== -1 && (
                    <span className='text-xs text-muted-foreground/70'>renews {plan.interval}</span>
                  )}
                </div>
              </li>
            );
          })}

          {PLAN_FEATURE_MAP[group].map((feature) => {
            const IconComponent = feature.icon;
            return (
              <li
                key={feature.label}
                className={cx('flex gap-2', feature.subText ? 'items-start' : 'items-center')}
              >
                <div className='p-1'>
                  <IconComponent className='w-4 h-4 text-muted-foreground' />
                </div>
                <div className='flex-1 flex flex-col justify-center'>
                  <span className='text-sm font-medium'>{feature.label}</span>
                  {feature.subText && (
                    <span className='text-xs text-muted-foreground/70'>{feature.subText}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      {/* <CardFooter className='mt-auto'>
        <Button
          className={`w-full`}
          variant={isPopular ? 'primary' : 'secondary'}
          icon={RiArrowRightLine}
          iconPosition='right'
          onClick={() => plan && onUpgrade?.(plan)}
          isLoading={isCreatingCheckout}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan
            ? 'Current Plan'
            : plan.name === 'Enterprise'
            ? 'Contact Sales'
            : 'Select Plan'}
        </Button>
      </CardFooter> */}
    </Card>
  );
};
