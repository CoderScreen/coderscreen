import React from 'react';

import { cx } from '@/components/ui/lib/utils';

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
      className={cx(
        'text-base md:text-sm text-muted-foreground tracking-wide',
        className
      )}
      ref={forwardedRef}
      {...props}
    />
  )
);

export { BodyText, MutedText };
