// Tremor Raw Button [v0.0.0]

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RiLoader2Fill } from '@remixicon/react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx, focusRing } from '@/components/ui/lib/utils';

const buttonVariants = tv({
  base: [
    // base
    'relative inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out',
    // disabled
    'disabled:pointer-events-none disabled:shadow-none',
    // focus
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        // border
        'border-transparent',
        // text color
        'text-white dark:text-gray-900',
        // background color
        'bg-primary dark:bg-gray-50',
        // hover color
        'hover:bg-primary/70 dark:hover:bg-gray-200',
        // disabled
        'disabled:bg-primary/50 disabled:text-neutral-400',
        'disabled:dark:bg-neutral-800 disabled:dark:text-neutral-600',
      ],
      secondary: [
        // border
        'border-gray-300 dark:border-gray-800',
        // text color
        'text-gray-900 dark:text-gray-50',
        // background color
        'bg-neutral-200 dark:bg-gray-950',
        //hover color
        'hover:bg-neutral-300 dark:hover:bg-gray-900/60',
        // disabled
        'disabled:text-gray-400',
        'disabled:dark:text-gray-600',
      ],
      light: [
        // base
        'shadow-none',
        // border
        'border-transparent',
        // text color
        'text-gray-900 dark:text-gray-50',
        // background color
        'bg-gray-200 dark:bg-gray-900',
        // hover color
        'hover:bg-gray-300/70 dark:hover:bg-gray-800/80',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
        'disabled:dark:bg-gray-800 disabled:dark:text-gray-600',
      ],
      ghost: [
        // base
        'shadow-none',
        // border
        'border-transparent',
        // text color
        'text-gray-900 dark:text-gray-50',
        // hover color
        'hover:bg-gray-100/90 dark:hover:bg-gray-800/80',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
        'disabled:dark:bg-gray-800 disabled:dark:text-gray-600',
      ],
      destructive: [
        // text color
        'text-white',
        // border
        'border-transparent',
        // background color
        'bg-red-600 dark:bg-red-700',
        // hover color
        'hover:bg-red-700 dark:hover:bg-red-600',
        // disabled
        'disabled:bg-red-300 disabled:text-white',
        'disabled:dark:bg-red-950 disabled:dark:text-red-400',
      ],
      icon: [
        // base
        'shadow-none px-1.5 py-1.5',
        // border
        'border-transparent',
        // text color
        'text-gray-900 dark:text-gray-50',
        // hover color
        'hover:bg-gray-100/90 dark:hover:bg-gray-800/80',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
        'disabled:dark:bg-gray-800 disabled:dark:text-gray-600',
      ],
      accent: [
        // border
        'border-transparent',
        // text color
        'text-white dark:text-gray-900',
        // background color
        'bg-amber-500',
        // hover color
        'hover:bg-amber-600',
        // disabled
        'disabled:bg-amber-600',
        'disabled:dark:bg-amber-800/60',
      ],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef
  ) => {
    const Component = asChild ? Slot : 'button';
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), 'gap-1.5', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className='pointer-events-none flex shrink-0 items-center justify-center gap-1.5'>
            <RiLoader2Fill
              className='size-4 shrink-0 animate-spin'
              aria-hidden='true'
            />
            <span className='sr-only'>
              {loadingText ? loadingText : 'Loading'}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
