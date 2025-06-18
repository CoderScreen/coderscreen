// Tremor Raw Select [v0.0.0]

import React from 'react';
import * as SelectPrimitives from '@radix-ui/react-select';
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from '@remixicon/react';

import { cx, focusInput, hasErrorInput } from '@/components/ui/lib/utils';

const Select = SelectPrimitives.Root;
Select.displayName = 'Select';

const SelectGroup = SelectPrimitives.Group;
SelectGroup.displayName = 'SelectGroup';

const SelectValue = SelectPrimitives.Value;
SelectValue.displayName = 'SelectValue';

const selectTriggerStyles = [
  cx(
    // base
    'group/trigger flex w-full select-none items-center justify-between truncate rounded-md border px-3 py-1.5 shadow-sm outline-none transition sm:text-sm',
    // border color
    'border-stone-300 dark:border-stone-800',
    // text color
    'text-stone-900 dark:text-stone-50',
    // placeholder
    'data-[placeholder]:text-stone-400 data-[placeholder]:dark:text-stone-500',
    // background color
    'bg-white dark:bg-stone-950',
    // hover
    'hover:bg-stone-50 hover:dark:bg-stone-950/50',
    // disabled
    'data-[disabled]:bg-stone-100 data-[disabled]:text-stone-400',
    'data-[disabled]:dark:border-stone-700 data-[disabled]:dark:bg-stone-800 data-[disabled]:dark:text-stone-500',
    focusInput
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
  ),
];

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & {
    hasError?: boolean;
  }
>(({ className, hasError, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cx(
        'relative',
        selectTriggerStyles,
        hasError ? hasErrorInput : '',
        className
      )}
      {...props}
    >
      <span className='truncate'>{children}</span>
      <SelectPrimitives.Icon asChild>
        <RiExpandUpDownLine
          className={cx(
            // base
            'size-4 shrink-0 absolute right-3',
            // text color
            'text-stone-400 dark:text-stone-600',
            // disabled
            'group-data-[disabled]/trigger:text-stone-300 group-data-[disabled]/trigger:dark:text-stone-600'
          )}
        />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <RiArrowUpSLine className='size-3 shrink-0' aria-hidden='true' />
  </SelectPrimitives.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <RiArrowDownSLine className='size-3 shrink-0' aria-hidden='true' />
  </SelectPrimitives.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitives.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = 'popper',
      children,
      sideOffset = 8,
      collisionPadding = 10,
      ...props
    },
    forwardedRef
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cx(
          // base
          'relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]',
          // widths
          'min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]',
          // heights
          'max-h-[--radix-select-content-available-height]',
          // background color
          'bg-white dark:bg-stone-950',
          // text color
          'text-stone-900 dark:text-stone-50',
          // border color
          'border-stone-300 dark:border-stone-800',
          // transition
          'will-change-[transform,opacity]',
          // "data-[state=open]:animate-slideDownAndFade",
          'data-[state=closed]:animate-hide',
          'data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade',
          className
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitives.Viewport
          className={cx(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]'
          )}
        >
          {children}
        </SelectPrimitives.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  )
);

SelectContent.displayName = 'SelectContent';

const SelectGroupLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx(
      // base
      'px-3 py-2 text-xs font-medium tracking-wide',
      // text color
      ' text-stone-500 dark:text-stone-500',
      className
    )}
    {...props}
  />
));

SelectGroupLabel.displayName = 'SelectGroupLabel';

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        'grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm',
        // text color
        'text-stone-900 dark:text-stone-50',
        // disabled
        'data-[disabled]:pointer-events-none data-[disabled]:text-stone-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-stone-600',
        // focus
        'focus-visible:bg-stone-100 focus-visible:dark:bg-stone-900',
        // hover
        'hover:bg-stone-100 hover:dark:bg-stone-900',
        className
      )}
      {...props}
    >
      <SelectPrimitives.ItemText className='flex-1 truncate'>
        {children}
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine
          className='size-5 shrink-0 text-stone-800 dark:text-stone-200'
          aria-hidden='true'
        />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  );
});

SelectItem.displayName = 'SelectItem';

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx(
      // base
      '-mx-1 my-1 h-px',
      // background color
      'bg-stone-300 dark:bg-stone-700',
      className
    )}
    {...props}
  />
));

SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
