// Tremor Raw Button [v0.0.0]

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RemixiconComponentType, RiLoader2Fill } from '@remixicon/react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx, focusRing } from '@/lib/utils';

const buttonVariants = tv({
  base: [
    // base
    'relative inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out cursor-pointer',
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
        'text-white',
        // background color
        'bg-primary',
        // hover color
        'hover:bg-primary/70',
        // disabled
        'disabled:bg-primary/50 disabled:text-neutral-200',
      ],
      secondary: [
        // border
        'border-gray-300',
        // text color
        'text-gray-900',
        // background color
        'bg-white',
        // hover color
        'hover:bg-gray-100',
        // disabled
        'disabled:text-gray-400',
      ],
      light: [
        // base
        'shadow-none',
        // border
        'border-transparent',
        // text color
        'text-gray-900',
        // background color
        'bg-gray-200',
        // hover color
        'hover:bg-gray-300/70',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
      ],
      ghost: [
        // base
        'shadow-none',
        // border
        'border-transparent',
        // text color
        'text-gray-900',
        // hover color
        'hover:bg-gray-100/90',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
      ],
      destructive: [
        // text color
        'text-white',
        // border
        'border-transparent',
        // background color
        'bg-red-500',
        // hover color
        'hover:bg-red-600',
        // disabled
        'disabled:bg-red-300 disabled:text-white',
      ],
      icon: [
        // base
        'shadow-none px-1.5 py-1.5',
        // border
        'border-transparent',
        // text color
        'text-gray-900',
        // hover color
        'hover:bg-gray-100/90',
        // disabled
        'disabled:bg-gray-100 disabled:text-gray-400',
      ],
      accent: [
        // border
        'border-transparent',
        // text color
        'text-white',
        // background color
        'bg-amber-500',
        // hover color
        'hover:bg-amber-600',
        // disabled
        'disabled:bg-amber-600',
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
  icon?: RemixiconComponentType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      icon,
      iconPosition = 'left',
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
        <span
          className={cx(
            'pointer-events-none flex  shrink-0 items-center justify-center gap-1.5',
            iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
          )}
        >
          {isLoading ? (
            <RiLoader2Fill
              className='size-4 shrink-0 animate-spin'
              aria-hidden='true'
            />
          ) : icon ? (
            React.createElement(icon, { className: 'size-4 shrink-0' })
          ) : null}
          {loadingText ? loadingText : children}
        </span>
      </Component>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
