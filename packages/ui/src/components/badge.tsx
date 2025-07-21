// Tremor Raw Badge [v0.0.0]

import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '@/lib/utils';

const badgeVariants = tv({
  base: cx(
    'inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs'
  ),
  variants: {
    variant: {
      default: ['bg-primary text-primary-foreground', ''],
      neutral: ['bg-gray-50 text-gray-700', ''],
      success: ['bg-emerald-50 text-emerald-700', ''],
      error: ['bg-red-50 text-red-700', ''],
      warning: ['bg-yellow-50 text-yellow-700', ''],
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
      <span
        ref={forwardedRef}
        className={cx(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants, type BadgeProps };
