// Tremor Raw Badge [v0.0.0]

import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '@/lib/utils';

const badgeVariants = tv({
  base: cx(
    'inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
  ),
  variants: {
    variant: {
      default: ['bg-blue-50 text-blue-900 ring-blue-500/30', ''],
      neutral: ['bg-gray-50 text-gray-900 ring-gray-500/30', ''],
      success: ['bg-emerald-50 text-emerald-900 ring-emerald-600/30', ''],
      error: ['bg-red-50 text-red-900 ring-red-600/20', ''],
      warning: ['bg-yellow-50 text-yellow-900 ring-yellow-600/30', ''],
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
