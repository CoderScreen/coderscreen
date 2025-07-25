'use client';

import { cx } from '@/lib/utils';
import { Button } from '@coderscreen/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@coderscreen/ui/card';
import { Badge } from '@coderscreen/ui/badge';
import {
  RiStarLine,
  RiTeamLine,
  RiCustomerServiceLine,
  RiGlobalLine,
  RiHistoryLine,
  RiSwap2Line,
  RiPaletteLine,
  RiTerminalWindowFill,
  RiBaseStationLine,
  RiLockPasswordLine,
  RiArrowRightLine,
  RemixiconComponentType,
} from '@remixicon/react';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@coderscreen/ui/toggle-group';
import { getBillingPlans } from '@/query/plans.query';
import { siteConfig } from '@/lib/siteConfig';

const LIMIT_MAP = {
  live_interviews: {
    icon: RiTerminalWindowFill,
    label: 'Live Interview',
    renews: true,
  },
  team_members: {
    icon: RiTeamLine,
    label: 'Team Member',
    renews: false,
  },
};

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

// Pricing plans data with monthly and yearly pricing
const PRICING_PLANS: {
  name: string;
  group: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  limit: {
    team_members: number;
    live_interviews: number;
  };
}[] = [
  {
    name: 'Basic',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    period: 'forever',
    description: 'Perfect for individual developers and small engineering teams',
    features: [
      'Unlimited coding interviews',
      'Real-time code collaboration',
      'Live code execution',
      'Up to 3 team members',
      'Community support',
    ],
    cta: 'Get started',
    popular: false,
    group: 'free',
    limit: {
      team_members: 1,
      live_interviews: 3,
    },
  },
  {
    name: 'Starter',
    monthlyPrice: '$50',
    yearlyPrice: '$500',
    period: 'per month',
    description: 'For engineering teams ready to scale their hiring process',
    features: [
      'Everything in Free',
      'Interview recording & playback',
      'Multi-language support',
      'API Access',
      'Up to 10 team members',
      'Basic Support',
    ],
    cta: 'Get started',
    popular: false,
    group: 'starter',
    limit: {
      team_members: 5,
      live_interviews: 20,
    },
  },
  {
    name: 'Scale',
    monthlyPrice: '$350',
    yearlyPrice: '$3500',
    period: 'per month',
    description: 'For high-growth teams that need advanced features and integrations',
    features: [
      'Everything in Starter',
      'ATS Integrations',
      'Custom Branding',
      'Priority Support',
      'Analytics Dashboard',
      'Up to 25 team members',
    ],
    cta: 'Get started',
    popular: true,
    group: 'scale',
    limit: {
      team_members: -1,
      live_interviews: 200,
    },
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    period: 'per year',
    description: 'For large tech companies and enterprise engineering teams',
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
    limit: {
      team_members: -1,
      live_interviews: -1,
    },
  },
];

export const LandingPricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id='pricing' className='w-full'>
      <div className='w-full pt-10 border-b border-border/50'>
        <div className='flex flex-col items-center gap-4 text-center mb-10'>
          <h2 className='text-3xl font-semibold'>Simple, transparent pricing</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Start free and scale as you grow. No hidden fees, no surprises. Choose the plan that
            fits your team's needs.
          </p>

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

        <div className='w-full grid grid-cols-2 lg:grid-cols-4 border-t border-border/50'>
          {PRICING_PLANS.slice(0, 4).map((plan, index) => (
            <Card
              key={plan.name}
              className={cx(
                'relative transition-all duration-200 flex flex-col h-full rounded-none shadow-none border-none',
                index === 1 ? 'border-y-0 border-border/50 border-solid' : '',
                index === 2 ? 'border-y-0 border-l-0 border-r border-border/50 border-solid' : '',
                plan.popular ? 'border-primary border-solid border-1' : ''
              )}
            >
              {plan.popular && (
                <Badge className='absolute top-4 right-4 bg-primary text-white flex items-center gap-1'>
                  <RiStarLine className='h-3 w-3' />
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className='text-2xl'>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className='text-2xl font-medium'>
                  {plan.name === 'Enterprise' ? (
                    'Custom'
                  ) : plan.monthlyPrice === '$0' ? (
                    'Free'
                  ) : (
                    <span>{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  )}

                  {plan.name !== 'Enterprise' ? (
                    <>
                      <span className='text-sm font-normal text-muted-foreground ml-1'>
                        {isYearly && plan.yearlyPrice !== '$0' ? '/year' : plan.period}
                      </span>
                      {isYearly && plan.yearlyPrice !== '$0' && (
                        <Badge className='ml-2' variant='success'>
                          2 months free
                        </Badge>
                      )}
                    </>
                  ) : null}
                </div>

                <a
                  href={
                    plan.name === 'Enterprise'
                      ? siteConfig.external.contactSales
                      : siteConfig.external.getStarted
                  }
                  className='w-full my-4'
                >
                  <Button
                    className='w-full'
                    variant={plan.popular ? 'primary' : 'secondary'}
                    icon={RiArrowRightLine}
                    iconPosition='right'
                  >
                    {plan.cta}
                  </Button>
                </a>
              </CardHeader>

              <CardContent className='flex-1'>
                <ul className='space-y-4'>
                  {Object.entries(LIMIT_MAP).map(
                    ([key, { icon: IconComponent, label, renews }]) => {
                      const rawValue = plan.limit[key as keyof typeof plan.limit];
                      const value =
                        rawValue === -1 ? 'Unlimited' : rawValue * (isYearly && renews ? 12 : 1);

                      return (
                        <li
                          key={key}
                          className={cx('flex gap-2', renews ? 'items-start' : 'items-center')}
                        >
                          <div className='p-1'>
                            <IconComponent className='w-4 h-4 text-muted-foreground' />
                          </div>
                          <div className='flex-1 flex flex-col justify-center'>
                            <span className='text-sm text-muted-foreground'>
                              {value} {label}
                              {typeof value === 'string' || (typeof value === 'number' && value > 1)
                                ? 's'
                                : ''}
                            </span>
                            {renews && (
                              <span
                                className={cx(
                                  'text-xs text-muted-foreground/70',
                                  rawValue === -1 ? 'opacity-0' : ''
                                )}
                              >
                                renews {isYearly ? 'yearly' : 'monthly'}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    }
                  )}

                  {PLAN_FEATURE_MAP[plan.group as keyof typeof PLAN_FEATURE_MAP].map(
                    (feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <li
                          key={index}
                          className={cx(
                            'flex gap-2',
                            feature.subText ? 'items-start' : 'items-center'
                          )}
                        >
                          <div className='p-1'>
                            <IconComponent className='w-4 h-4 text-muted-foreground' />
                          </div>
                          <div className='flex-1 flex flex-col justify-center '>
                            <span className='text-sm text-muted-foreground'>{feature.label}</span>
                            {feature.subText && (
                              <span className='text-xs text-muted-foreground/70'>
                                {feature.subText}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    }
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
