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
import { RiCodeLine, RiTeamLine, RiArrowRightLine } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { PlanSchema } from '@coderscreen/api/schema/billing';

export const BillingPlanCard = ({
  monthly,
  yearly,
  mode,
  currentPlanId,
  isPopular = false,
  onUpgrade,
  isCreatingCheckout = false,
}: {
  monthly: PlanSchema | null;
  yearly: PlanSchema | null;
  mode: PlanSchema['interval'];
  currentPlanId?: string;
  isPopular?: boolean;
  onUpgrade?: (plan: PlanSchema) => void;
  isCreatingCheckout?: boolean;
}) => {
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
          <li className='flex items-center gap-2'>
            <div className='p-1 rounded bg-gray-100'>
              <RiCodeLine className='w-4 h-4 text-muted-foreground' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {plan.name === 'Free'
                    ? '5 Interviews'
                    : plan.name === 'Starter'
                    ? '50 Interviews'
                    : plan.name === 'Professional'
                    ? '200 Interviews'
                    : 'Unlimited Interviews'}
                </span>
              </div>
            </div>
          </li>
          <li className='flex items-center gap-2'>
            <div className='p-1 rounded bg-gray-100'>
              <RiTeamLine className='w-4 h-4 text-muted-foreground' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {plan.name === 'Free'
                    ? '3 Team Members'
                    : plan.name === 'Starter'
                    ? '5 Team Members'
                    : plan.name === 'Professional'
                    ? '15 Team Members'
                    : 'Unlimited Team Members'}
                </span>
              </div>
            </div>
          </li>
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
