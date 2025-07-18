'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps } from 'tailwind-variants';

import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

type ToggleGroupElement = React.ElementRef<typeof ToggleGroupPrimitive.Root>;
type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>;

const ToggleGroup = React.forwardRef<ToggleGroupElement, ToggleGroupProps>(
  ({ className, variant, size, children, ...props }, forwardedRef) => {
    return (
      <ToggleGroupPrimitive.Root
        ref={forwardedRef}
        data-slot='toggle-group'
        data-variant={variant}
        data-size={size}
        className={cn(
          'group/toggle-group flex w-fit items-center rounded-lg bg-gray-100 p-1 transition-colors duration-200 ease-in-out',
          className
        )}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive.Root>
    );
  }
);

ToggleGroup.displayName = 'ToggleGroup';

type ToggleGroupItemElement = React.ElementRef<typeof ToggleGroupPrimitive.Item>;
type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>;

const ToggleGroupItem = React.forwardRef<ToggleGroupItemElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, ...props }, forwardedRef) => {
    const context = React.useContext(ToggleGroupContext);

    return (
      <ToggleGroupPrimitive.Item
        ref={forwardedRef}
        data-slot='toggle-group-item'
        data-variant={context.variant || variant}
        data-size={context.size || size}
        className={cn(
          'relative flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium',
          'transition-colors duration-200 ease-in-out',
          'data-[state=off]:text-gray-600 data-[state=off]:hover:text-gray-900 data-[state=off]:hover:bg-gray-50',
          'data-[state=on]:bg-white data-[state=on]:text-gray-900 data-[state=on]:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    );
  }
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };
