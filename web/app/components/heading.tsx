import React from 'react';

import { cx } from '@/components/ui/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

const TinyHeader = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, forwardedRef) => (
    <h4
      className={cx('text-base font-medium', className)}
      ref={forwardedRef}
      {...props}
    />
  )
);

const SmallHeader = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, forwardedRef) => (
    <h3
      className={cx('text-lg font-medium', className)}
      ref={forwardedRef}
      {...props}
    />
  )
);

const LargeHeader = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, forwardedRef) => (
    <h2
      className={cx('text-2xl font-medium', className)}
      ref={forwardedRef}
      {...props}
    />
  )
);

export { TinyHeader, SmallHeader, LargeHeader };
