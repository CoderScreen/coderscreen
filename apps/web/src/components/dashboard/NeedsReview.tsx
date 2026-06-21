import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { RiCheckLine, RiTimeLine } from '@remixicon/react';
import { cx } from '@/lib/utils';
import { MOCK_NEEDS_REVIEW, type ReviewItem } from './mockData';

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

const scoreColor = (pct: number) => {
  if (pct >= 85) return 'text-emerald-600';
  if (pct >= 65) return 'text-amber-600';
  return 'text-red-600';
};

const ReviewRow = ({ item }: { item: ReviewItem }) => {
  return (
    <div className='group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50'>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
        <span className='text-xs font-medium text-white'>{initials(item.candidateName)}</span>
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-gray-900'>{item.candidateName}</p>
        <p className='truncate text-xs text-muted-foreground'>{item.assessmentTitle}</p>
      </div>

      <div className='hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex'>
        <RiTimeLine className='size-3.5' />
        {item.timeSpent}
      </div>

      <div className='hidden w-20 shrink-0 text-right sm:block'>
        <span className={cx('text-sm font-semibold tabular-nums', scoreColor(item.scorePct))}>
          {item.score}
        </span>
      </div>

      <div className='w-28 shrink-0 text-right'>
        <span className='text-xs text-muted-foreground group-hover:hidden'>
          {item.submittedAgo}
        </span>
        <div className='hidden justify-end group-hover:flex'>
          <Button variant='secondary'>Review</Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center gap-2 px-4 py-12 text-center'>
    <div className='flex size-10 items-center justify-center rounded-full bg-emerald-50'>
      <RiCheckLine className='size-5 text-emerald-600' />
    </div>
    <p className='text-sm font-medium text-gray-900'>You’re all caught up</p>
    <p className='text-xs text-muted-foreground'>No submissions waiting for review.</p>
  </div>
);

export const NeedsReview = () => {
  const items = MOCK_NEEDS_REVIEW;

  return (
    <div className='flex flex-col rounded-lg border border-gray-200 bg-white'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-medium text-gray-900'>Needs review</h3>
          {items.length > 0 && <Badge variant='warning'>{items.length}</Badge>}
        </div>
        {items.length > 0 && (
          <button
            type='button'
            className='text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer'
          >
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className='divide-y divide-gray-100'>
          {items.map((item) => (
            <ReviewRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
