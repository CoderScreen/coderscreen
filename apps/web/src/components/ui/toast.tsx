'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className='toaster group'
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-lg border p-4',
          description: 'group-[.toast]:text-muted-foreground text-sm',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity',
          closeButton:
            'group-[.toast]:text-muted-foreground hover:text-foreground transition-colors',
          success:
            'group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900 group-[.toaster]:border-emerald-200',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
