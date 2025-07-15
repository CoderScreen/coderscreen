import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ProgressCircle } from '@/components/ui/progresscircle';
import {
  RiFileTextLine,
  RiBarChartLine,
  RiRefreshLine,
  RiGroupLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiCodeLine,
  RiTimeLine,
  RiUserLine,
  RiTeamLine,
} from '@remixicon/react';
import { cx } from '@/lib/utils';

// Common styling constants
const CARD_BASE_STYLES = '';
const CARD_LIMIT_WARNING_STYLES = 'bg-red-50 border-red-200';
const USAGE_LABEL_STYLES = 'text-sm text-muted-foreground mb-1';
const USAGE_VALUE_STYLES = 'font-medium';
const USAGE_SUBTEXT_STYLES = 'text-xs text-muted-foreground';

export const BillingView = () => {
  // Realistic data for a technical interview platform
  const workspaceInfo = {
    name: 'Engineering Team',
    id: '360',
    plan: 'Free',
    planDetails: '5 Interviews per month',
    owner: 'You',
  };

  const usageStats = {
    interviews: { used: 2, limit: 5 },
    teamSize: { used: 3, limit: 3 },
    workspaces: { used: 1, limit: 1 },
    codeExecutions: { used: 15, limit: 50 },
    apiRateLimit: '100 per minute',
  };

  const availablePlans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small teams and startups',
      features: [
        {
          icon: RiCodeLine,
          text: '50 Interviews',
          subtitle: 'Unlimited candidates per interview',
          hasDropdown: false,
        },
        {
          icon: RiTeamLine,
          text: '5 Team Members',
          subtitle: 'Interviewers and admins',
          hasDropdown: false,
        },
        {
          icon: RiTimeLine,
          text: 'Real-time Collaboration',
          subtitle: 'Live coding with candidates',
          hasDropdown: false,
        },
        {
          icon: RiFileTextLine,
          text: '10 Templates',
          subtitle: 'Pre-built interview questions',
          hasDropdown: false,
        },
      ],
      popular: false,
      enterprise: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'For growing engineering teams',
      features: [
        {
          icon: RiCodeLine,
          text: '200 Interviews',
          subtitle: 'Unlimited candidates per interview',
          hasDropdown: false,
        },
        {
          icon: RiTeamLine,
          text: '15 Team Members',
          subtitle: 'Interviewers and admins',
          hasDropdown: false,
        },
        {
          icon: RiTimeLine,
          text: 'Advanced Analytics',
          subtitle: 'Interview performance insights',
          hasDropdown: false,
        },
        {
          icon: RiFileTextLine,
          text: 'Unlimited Templates',
          subtitle: 'Custom interview questions',
          hasDropdown: false,
        },
        {
          icon: RiUserLine,
          text: 'Candidate Management',
          subtitle: 'Track and organize candidates',
          hasDropdown: false,
        },
      ],
      popular: true,
      enterprise: false,
    },
    {
      name: 'Scale',
      price: '$149',
      period: 'per month',
      description: 'For large engineering teams',
      features: [
        {
          icon: RiCodeLine,
          text: '500 Interviews',
          subtitle: 'Unlimited candidates per interview',
          hasDropdown: false,
        },
        {
          icon: RiTeamLine,
          text: '25 Team Members',
          subtitle: 'Interviewers and admins',
          hasDropdown: false,
        },
        {
          icon: RiTimeLine,
          text: 'Advanced Security',
          subtitle: 'SSO, audit logs, compliance',
          hasDropdown: false,
        },
        {
          icon: RiFileTextLine,
          text: 'Custom Branding',
          subtitle: 'White-label experience',
          hasDropdown: false,
        },
        {
          icon: RiUserLine,
          text: 'Priority Support',
          subtitle: 'Dedicated account manager',
          hasDropdown: false,
        },
      ],
      popular: false,
      enterprise: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For organizations with custom needs',
      features: [
        {
          icon: RiCodeLine,
          text: 'Unlimited Interviews',
          subtitle: 'No limits on interviews',
          hasDropdown: true,
        },
        {
          icon: RiTeamLine,
          text: 'Unlimited Team Members',
          subtitle: 'Scale with your organization',
          hasDropdown: false,
        },
        {
          icon: RiTimeLine,
          text: 'Custom Integrations',
          subtitle: 'API access, webhooks, SSO',
          hasDropdown: false,
        },
        {
          icon: RiFileTextLine,
          text: 'Dedicated Support',
          subtitle: '24/7 phone and email support',
          hasDropdown: false,
        },
        {
          icon: RiUserLine,
          text: 'Custom SLA',
          subtitle: 'Guaranteed uptime and response times',
          hasDropdown: false,
        },
      ],
      popular: false,
      enterprise: true,
    },
  ];

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
    const percentage = getUsagePercentage(used, limit);

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
      <div className=''>
        <SmallHeader>Billing & Usage</SmallHeader>
        <MutedText>Manage your interview platform subscription and usage</MutedText>
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
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Switch id='annual-discount' />
            <label htmlFor='annual-discount' className='text-sm'>
              Annual Discount (two months free)
            </label>
          </div>
          <Button variant='secondary'>Need Help? Contact Support</Button>
        </div>
      </div>

      {/* Available Plans */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {availablePlans.map((plan) => (
          <Card
            key={plan.name}
            className={cx(
              'relative transition-all duration-200 flex flex-col',
              plan.popular ? 'ring-2 ring-primary shadow-lg' : ''
            )}
          >
            {plan.popular && (
              <Badge className='absolute top-4 right-4 bg-primary text-white'>Most Popular</Badge>
            )}

            <CardHeader>
              <CardTitle className='text-lg'>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className='text-2xl'>
                {plan.price}
                <span className='text-sm font-normal text-muted-foreground ml-1'>
                  {plan.period}
                </span>
              </div>
            </CardHeader>

            <CardContent className='flex-1'>
              <ul className='space-y-4'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-center gap-2'>
                    <div className='p-1 rounded bg-gray-100'>
                      <feature.icon className='w-4 h-4 text-muted-foreground' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>{feature.text}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className='mt-auto'>
              <Button
                className={`w-full`}
                variant={plan.popular ? 'primary' : 'secondary'}
                icon={RiArrowRightLine}
                iconPosition='right'
              >
                {plan.enterprise ? 'Contact Sales' : 'Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
