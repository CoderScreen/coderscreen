import { RiTimeLine } from '@remixicon/react';
import { type InProgressItem, MOCK_IN_PROGRESS } from './mockData';

const InProgressRow = ({ item }: { item: InProgressItem }) => {
  return (
    <div className='flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer'>
      <div className='flex items-center justify-between gap-2'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-gray-900'>{item.candidateName}</p>
          <p className='truncate text-xs text-muted-foreground'>{item.assessmentTitle}</p>
        </div>
        <span className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground'>
          <RiTimeLine className='size-3.5' />
          {item.timeLeft}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100'>
          <div
            className='h-full rounded-full bg-blue-500 transition-all'
            style={{ width: `${item.progressPct}%` }}
          />
        </div>
        <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
          {item.progressLabel}
        </span>
      </div>
    </div>
  );
};

export const InProgressAssessments = () => {
  return (
    <div className='flex flex-col rounded-lg border border-gray-200 bg-white'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
        <h3 className='text-sm font-medium text-gray-900'>In progress</h3>
        <span className='text-xs text-muted-foreground'>{MOCK_IN_PROGRESS.length} active</span>
      </div>

      <div className='divide-y divide-gray-100'>
        {MOCK_IN_PROGRESS.map((item) => (
          <InProgressRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
