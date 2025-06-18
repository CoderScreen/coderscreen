// Tremor Raw Divider [v0.0.0]

import React from 'react';

import { cx } from '@/components/ui/lib/utils';

interface DividerProps extends React.ComponentPropsWithoutRef<'div'> {}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, children, ...props }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cx(
        // base
        'mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm',
        // text color
        'text-gray-500 dark:text-gray-500',
        className
      )}
      {...props}
    >
      {children ? (
        <>
          <div
            className={cx(
              // base
              'h-[1px] w-full',
              // background color
              'bg-gray-200 dark:bg-gray-800'
            )}
          />
          <div className='whitespace-nowrap text-inherit'>{children}</div>
          <div
            className={cx(
              // base
              'h-[1px] w-full',
              // background color
              'bg-gray-200 dark:bg-gray-800'
            )}
          />
        </>
      ) : (
        <div
          className={cx(
            // base
            'h-[1px] w-full',
            // backround color
            'bg-gray-200 dark:bg-gray-800'
          )}
        />
      )}
    </div>
  )
);

const VerticalDivider = React.forwardRef<
  HTMLDivElement,
  DividerProps & { containerClassName?: string }
>(({ containerClassName, className, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    className={cx(
      // base
      'flex justify-center h-full text-sm py-2',
      // text color
      'text-border',
      containerClassName
    )}
    {...props}
  >
    <div
      className={cx(
        // base
        'w-[1px] h-full',
        // backround color
        'bg-border',
        className
      )}
    />
  </div>
));

Divider.displayName = 'Divider';
VerticalDivider.displayName = 'VerticalDivider';

export { Divider, VerticalDivider };
