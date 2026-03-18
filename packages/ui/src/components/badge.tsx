// Tremor Raw Badge [v0.0.0]

import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '../lib/utils';

const badgeVariants = tv({
  base: cx('inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs'),
  variants: {
    variant: {
      default: ['bg-primary text-primary-foreground', ''],
      neutral: ['bg-gray-100 text-gray-800', ''],
      success: ['bg-emerald-100 text-emerald-800', ''],
      error: ['bg-red-100 text-red-800', ''],
      warning: ['bg-yellow-100 text-yellow-800', ''],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps
  extends React.ComponentPropsWithoutRef<'span'>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }: BadgeProps, forwardedRef) => {
    return (
      <span ref={forwardedRef} className={cx(badgeVariants({ variant }), className)} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants, type BadgeProps };
