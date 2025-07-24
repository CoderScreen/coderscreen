'use client';
import { cx } from '@/lib/utils';
import { Button } from '@coderscreen/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@coderscreen/ui/card';
import { Badge } from '@coderscreen/ui/badge';
import { RiCheckLine, RiStarLine } from '@remixicon/react';
import { useState } from 'react';
import { Switch } from '@coderscreen/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@coderscreen/ui/toggle-group';

// Pricing plans data with monthly and yearly pricing
const PRICING_PLANS = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: 'forever',
    description: 'Perfect for individual developers and small teams getting started.',
    features: [
      'Unlimited interviews',
      'Real-time collaboration',
      'Basic code execution',
      'Up to 3 team members',
      'Community support',
    ],
    cta: 'Get started free',
    popular: false,
    group: 'free',
  },
  {
    name: 'Starter',
    monthlyPrice: '$19',
    yearlyPrice: '$190',
    period: 'per month',
    description: 'For growing teams that need advanced features and better support.',
    features: [
      'Everything in Free',
      'Interview Playback',
      'Advanced Interviews',
      'API Access',
      'Up to 10 team members',
      'Basic Support',
    ],
    cta: 'Start free trial',
    popular: false,
    group: 'starter',
  },
  {
    name: 'Pro',
    monthlyPrice: '$49',
    yearlyPrice: '$490',
    period: 'per month',
    description: 'For established teams that need advanced integrations and priority support.',
    features: [
      'Everything in Starter',
      'ATS Integrations',
      'Custom Branding',
      'Priority Support',
      'Analytics Dashboard',
      'Up to 25 team members',
    ],
    cta: 'Start free trial',
    popular: true,
    group: 'pro',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    period: 'per year',
    description: 'For large organizations with advanced security and compliance needs.',
    features: [
      'Everything in Scale',
      'SSO integration',
      'Advanced security',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'White-glove onboarding',
    ],
    cta: 'Contact sales',
    popular: false,
    group: 'enterprise',
  },
];

export const LandingPricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className='w-full'>
      <div className='w-full py-10 border-b border-border/50'>
        <div className='flex flex-col gap-4 text-center mb-12'>
          <h2 className='text-3xl font-semibold'>Simple, transparent pricing</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Start free and scale as you grow. No hidden fees, no surprises. Choose the plan that
            fits your team's needs.
          </p>

          {/* Pricing Toggle */}
          <div className='flex items-center justify-end gap-4 mt-6 px-6'>
            <ToggleGroup
              type='single'
              value={isYearly ? 'yearly' : 'monthly'}
              onValueChange={(value: string) => setIsYearly(value === 'yearly')}
            >
              <ToggleGroupItem value='monthly'>Monthly</ToggleGroupItem>
              <ToggleGroupItem value='yearly' className='flex items-center gap-1'>
                Yearly
                <Badge variant='success' className='text-xs'>
                  2 months free
                </Badge>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className='w-full grid grid-cols-1 lg:grid-cols-4 mb-6'>
          {PRICING_PLANS.slice(0, 4).map((plan, index) => (
            <Card
              key={plan.name}
              className={cx(
                'py-12 relative h-full flex flex-col rounded-none shadow-none ring-none border-y border-border/50 border-solid',
                index === 1
                  ? 'border-solid border-l border-r border-border/50'
                  : index === 2
                  ? 'border-solid border-l-0 border-r border-border/50'
                  : 'border-x-0'
              )}
            >
              {plan.popular && (
                <Badge className='absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1'>
                  <RiStarLine className='h-3 w-3' />
                  Most Popular
                </Badge>
              )}

              <CardHeader className='text-center pb-4'>
                <CardTitle className='text-xl font-bold'>{plan.name}</CardTitle>
                <div className='flex items-baseline justify-center gap-1'>
                  <span className='text-3xl font-bold'>
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>

                  {plan.name !== 'Enterprise' && (
                    <span className='text-muted-foreground text-sm'>
                      {isYearly ? '/year' : plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className='text-sm'>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className='flex-1'>
                <Button variant={plan.popular ? 'primary' : 'secondary'} className='w-full mb-4'>
                  {plan.cta}
                </Button>
              </CardContent>

              <CardFooter className='pt-0'>
                <ul className='space-y-3 w-full'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2'>
                      <RiCheckLine className='h-4 w-4 text-green-600 mt-0.5 shrink-0' />
                      <span className='text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
