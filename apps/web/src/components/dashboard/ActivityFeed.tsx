import { cx } from '@/lib/utils';
import { ACTIVITY_STYLES, type ActivityItem, MOCK_ACTIVITY } from './mockData';

const ActivityRow = ({ item }: { item: ActivityItem }) => {
  const style = ACTIVITY_STYLES[item.type];

  return (
    <div className='flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer'>
      <div
        className={cx(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
          style.bgClassName
        )}
      >
        <style.icon className={cx('size-4', style.iconClassName)} aria-hidden='true' />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='text-sm text-gray-900 leading-snug'>{item.title}</p>
        <p className='text-xs text-muted-foreground mt-0.5'>{item.body}</p>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <span className='text-xs text-muted-foreground whitespace-nowrap'>{item.timeAgo}</span>
        {item.unread && (
          <span className='size-2 rounded-full bg-blue-500' role='img' aria-label='Unread' />
        )}
      </div>
    </div>
  );
};

export const ActivityFeed = () => {
  return (
    <div className='flex flex-col rounded-lg border border-gray-200 bg-white'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
        <h3 className='text-sm font-medium text-gray-900'>Recent activity</h3>
        <button
          type='button'
          className='text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer'
        >
          View all
        </button>
      </div>

      <div className='divide-y divide-gray-100'>
        {MOCK_ACTIVITY.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
