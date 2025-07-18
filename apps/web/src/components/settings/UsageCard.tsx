import { UsageResultSchema } from '@coderscreen/api/schema/usage';
import { MutedText } from '@/components/ui/typography';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cx } from '@/lib/utils';

// Common styling constants
const CARD_LIMIT_WARNING_STYLES = 'bg-red-50 border-red-200';
const USAGE_VALUE_STYLES = 'font-medium';
const USAGE_SUBTEXT_STYLES = 'text-xs text-muted-foreground';

const USAGE_TYPE_MAP = {
  live_interview: {
    label: 'Live Interviews',
  },
  team_members: {
    label: 'Team Members',
  },
} as const satisfies Record<UsageResultSchema['eventType'], { label: string }>;

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

export const UsageCard = ({ usage }: { usage: UsageResultSchema }) => {
  const usageInfo = USAGE_TYPE_MAP[usage.eventType];

  return (
    <UsageStatCard
      label={usageInfo.label}
      value={`${usage.count} / ${usage.limit}`}
      used={usage.count}
      limit={usage.limit}
      isAtLimit={usage.exceeded}
    />
  );
};
