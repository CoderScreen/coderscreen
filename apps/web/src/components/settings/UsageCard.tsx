import { UsageResultSchema } from '@coderscreen/api/schema/usage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Gauge } from '@/components/ui/gauge';
import { Skeleton } from '@/components/ui/skeleton';
import { MutedText } from '@/components/ui/typography';
import { cx } from '@/lib/utils';

// Common styling constant
const CARD_WARNING_STYLES = 'bg-amber-50 border-amber-200';
const CARD_LIMIT_STYLES = 'bg-red-50 border-red-200';
const USAGE_VALUE_STYLES = 'font-medium ml-2';

const USAGE_TYPE_MAP = {
  live_interview: {
    label: 'Live Interviews',
  },
  team_members: {
    label: 'Team Members',
  },
} as const satisfies Record<UsageResultSchema['eventType'], { label: string }>;

export const UsageCard = ({
  usage,
  isLoading = false,
}: {
  usage?: UsageResultSchema;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader className='pb-2'>
          <Skeleton className='h-4 w-24' />
        </CardHeader>
        <CardContent className='flex items-center gap-2'>
          <Skeleton className='h-5 w-16' />
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const usageInfo = USAGE_TYPE_MAP[usage.eventType];
  const percent = Math.round((usage.count / usage.limit) * 100);

  return (
    <Card
      className={cx(
        'h-full',
        percent > 70 ? (usage.exceeded ? CARD_LIMIT_STYLES : CARD_WARNING_STYLES) : ''
      )}
    >
      <CardHeader className='pb-0'>
        <MutedText>{usageInfo.label}</MutedText>
      </CardHeader>
      <CardContent className='flex items-center'>
        <Gauge value={percent} size={20} strokeWidth={12} showAnimation reverseValue />
        {/* <ProgressCircle
          value={percent}
          radius={8}
          strokeWidth={2}
          variant={percent > 80 ? (usage.exceeded ? 'error' : 'warning') : 'default'}
        /> */}
        <p className={USAGE_VALUE_STYLES}>
          {usage.count} / {usage.limit}
        </p>
      </CardContent>
    </Card>
  );
};
