import { cx } from '@/components/ui/lib/utils';
import { Badge } from './badge';
import { ReactNode } from 'react';
import { SmallHeader } from '@/components/ui/heading';

export type CardProps = {
  className?: string;
  title: string;
  change?: string | null;
  value: string;
  subtitle: string;
  emptyText?: string | ReactNode;
  // ctaDescription: string;
  // ctaText: string;
  // ctaLink: string | null;
  data?: {
    title: string;
    value: string;
    percentage: number;
    color: string;
  }[];
};

export function CategoryBarCard({
  className,
  title,
  change,
  value,
  subtitle,
  emptyText,
  // ctaDescription,
  // ctaText,
  // ctaLink,
  data,
}: CardProps) {
  const emptyNode =
    emptyText === undefined ? (
      <div className='flex items-center gap-2 text-xs'>
        <span className='size-2.5 rounded-sm bg-gray-500' aria-hidden='true' />
        <span className='text-gray-500'>No data found</span>
      </div>
    ) : typeof emptyText !== 'string' ? (
      emptyText
    ) : (
      <span>{emptyText}</span>
    );

  const isLoading = data === undefined;
  const isEmpty = data && data.length === 0;

  return (
    <div className={cx('h-full flex flex-col justify-between', className)}>
      <div>
        <div className='flex items-center gap-2'>
          <SmallHeader className='text-muted-foreground text-sm'>
            {title}
          </SmallHeader>
        </div>
        <p className='mt-2 flex items-center gap-2'>
          <span className='text-2xl text-gray-900 dark:text-gray-50'>
            {value}
          </span>
          {change ? <Badge variant='success'>{change}</Badge> : null}
        </p>
        <div className='mt-4'>
          <p className='text-sm font-medium text-gray-900 dark:text-gray-50'>
            {subtitle}
          </p>
          <div className='mt-2 flex items-center gap-0.5'>
            {isLoading ? (
              <div className='h-1.5 rounded-full bg-gray-200 w-full' />
            ) : isEmpty ? (
              <div className='h-1.5 rounded-full bg-gray-500 w-full' />
            ) : (
              data.map((item) => (
                <div
                  key={item.title}
                  className={cx(item.color, `h-1.5 rounded-full`)}
                  style={{ width: `${item.percentage}%` }}
                />
              ))
            )}
          </div>
        </div>
        <ul role='list' className='mt-5 space-y-2 max-h-24 overflow-y-auto'>
          {isLoading ? (
            <li className='flex items-center gap-2 text-xs'>
              <span
                className='size-2.5 rounded-sm bg-gray-200'
                aria-hidden='true'
              />
              <span className='text-gray-400'>Loading...</span>
            </li>
          ) : isEmpty ? (
            <li className='flex items-center gap-2 text-xs'>{emptyNode}</li>
          ) : (
            data.map((item) => (
              <li key={item.title} className='flex items-center gap-2 text-xs'>
                <span
                  className={cx(item.color, 'size-2.5 rounded-sm')}
                  aria-hidden='true'
                />
                <span className='text-gray-900 dark:text-gray-50'>
                  {item.title}
                </span>
                <span className='text-gray-600 dark:text-gray-400'>
                  ({item.value} / {item.percentage}%)
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
      {/* <p className='mt-6 text-xs text-gray-500'>
        {ctaDescription}{' '}
        {ctaLink ? (
          <a href={ctaLink} className='text-primary'>
            {ctaText}
          </a>
        ) : (
          <span className='text-primary hover:cursor-pointer'>{ctaText}</span>
        )}
      </p> */}
    </div>
  );
}
