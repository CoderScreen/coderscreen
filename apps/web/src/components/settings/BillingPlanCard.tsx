import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RiCodeLine, RiTeamLine, RiArrowRightLine, RemixiconComponentType } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { PlanSchema } from '@coderscreen/api/schema/billing';

const PLAN_FEATURE_MAP: Record<
  'free' | 'starter' | 'pro' | 'scale' | 'enterprise',
  Array<{
    icon: RemixiconComponentType;
    label: string;
  }>
> = {
  free: [
    { icon: RiCodeLine, label: '5 Interviews' },
    { icon: RiTeamLine, label: '3 Team Members' },
  ],
  starter: [
    { icon: RiCodeLine, label: '50 Interviews' },
    { icon: RiTeamLine, label: '5 Team Members' },
  ],
  pro: [
    { icon: RiCodeLine, label: '200 Interviews' },
    { icon: RiTeamLine, label: '15 Team Members' },
  ],
  scale: [
    { icon: RiCodeLine, label: 'Unlimited Interviews' },
    { icon: RiTeamLine, label: 'Unlimited Team Members' },
  ],
  enterprise: [
    { icon: RiCodeLine, label: 'Unlimited Interviews' },
    { icon: RiTeamLine, label: 'Unlimited Team Members' },
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
  group: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
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
  if (!plan || plan.price === 0) {
    return null;
  }

  return (
    <Card
      key={plan.id}
      className={cx(
        'relative transition-all duration-200 flex flex-col',
        isPopular ? 'ring-2 ring-primary shadow-lg' : '',
        isCurrentPlan ? 'ring-1 ring-green-300 bg-green-50/50 border-green-100' : ''
      )}
    >
      {isPopular && (
        <Badge className='absolute top-4 right-4 bg-primary text-white'>Most Popular</Badge>
      )}

      <CardHeader>
        <CardTitle className='text-lg'>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className='text-2xl'>
          {plan.name === 'Enterprise'
            ? 'Custom'
            : plan.price === 0 || plan.price === null
            ? 'Free'
            : `$${plan.price}`}

          {plan.price > 0 && plan.name !== 'Enterprise' && (
            <span className='text-sm font-normal text-muted-foreground ml-1'>
              per {plan.interval}
            </span>
          )}

          {isYearly && plan.price !== 0 && plan.price !== null && plan.name !== 'Enterprise' && (
            <Badge className='ml-2' variant='success'>
              2 months free
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='flex-1'>
        <ul className='space-y-4'>
          {PLAN_FEATURE_MAP[group].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <li key={index} className='flex items-center gap-2'>
                <div className='p-1 rounded bg-gray-100'>
                  <IconComponent className='w-4 h-4 text-muted-foreground' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>{feature.label}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className='mt-auto'>
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
      </CardFooter>
    </Card>
  );
};
