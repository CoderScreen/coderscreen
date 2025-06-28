import React from 'react';

import { cx } from '@/lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const BodyText = React.forwardRef<HTMLDivElement, TextProps>(
  ({ className, ...props }, forwardedRef) => (
    <div
      className={cx('text-base tracking-wide', className)}
      ref={forwardedRef}
      {...props}
    />
  )
);

const MutedText = React.forwardRef<HTMLDivElement, TextProps>(
  ({ className, ...props }, forwardedRef) => (
    <div
      className={cx('text-sm text-gray-500', className)}
      ref={forwardedRef}
      {...props}
    />
  )
);

export { BodyText, MutedText };
