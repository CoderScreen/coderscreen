// Tremor Raw Dialog [v0.0.0]

import React from 'react';
import * as DialogPrimitives from '@radix-ui/react-dialog';

import { cx, focusRing } from '@/components/ui/lib/utils';

const Dialog = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Root>
) => {
  return <DialogPrimitives.Root {...props} />;
};
Dialog.displayName = 'Dialog';

const DialogTrigger = DialogPrimitives.Trigger;

DialogTrigger.displayName = 'DialogTrigger';

const DialogClose = DialogPrimitives.Close;

DialogClose.displayName = 'DialogClose';

const DialogPortal = DialogPrimitives.Portal;

DialogPortal.displayName = 'DialogPortal';

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Overlay> & {
    handleOpenChange?: (open: boolean) => void;
  }
>(({ className, handleOpenChange, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        'fixed z-50 inset-0 overflow-y-auto',
        // background color
        'bg-black/70',
        // transition
        'data-[state=open]:animate-dialogOverlayShow',
        className
      )}
      {...props}
      onClick={(e) => {
        // only close if the click is on the overlay itself, ignore bubbling clicks
        if (e.target === e.currentTarget) {
          handleOpenChange?.(false);
        }
      }}
    />
  );
});

DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content> & {
    handleOpenChange?: (open: boolean) => void;
    overlayClassName?: string;
  }
>(
  (
    { className, handleOpenChange, overlayClassName, ...props },
    forwardedRef
  ) => {
    return (
      <DialogPortal>
        <DialogOverlay
          handleOpenChange={handleOpenChange}
          className={overlayClassName}
        >
          <DialogPrimitives.Content
            ref={forwardedRef}
            className={cx(
              // base
              'fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border p-6 shadow-lg',
              // border color
              'border-slate-200 dark:border-stone-900 ',
              // background color
              'bg-white dark:bg-stone-900',
              // transition
              'data-[state=open]:animate-dialogContentShow',
              focusRing,
              className
            )}
            {...props}
          />
        </DialogOverlay>
      </DialogPortal>
    );
  }
);

DialogContent.displayName = 'DialogContent';

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cx('flex flex-col gap-y-1', className)} {...props} />;
};

DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      'text-lg font-semibold',
      // text color
      'text-stone-900 dark:text-stone-50',
      className
    )}
    {...props}
  />
));

DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Description
      ref={forwardedRef}
      className={cx('text-stone-500 dark:text-stone-500', className)}
      {...props}
    />
  );
});

DialogDescription.displayName = 'DialogDescription';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
      {...props}
    />
  );
};

DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
