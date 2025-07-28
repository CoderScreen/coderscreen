// Tremor Raw Textarea [v0.0.0]

import React from 'react';

import { cx, focusInput, hasErrorInput } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }: TextareaProps, forwardedRef) => {
    return (
      <textarea
        ref={forwardedRef}
        className={cx(
          // base
          'flex min-h-[4rem] w-full rounded-md border px-3 py-1.5 shadow-sm outline-none sm:text-sm',
          // text color
          'text-gray-900',
          // border color
          'border-gray-300',
          // background color
          'bg-white',
          // placeholder color
          'placeholder-gray-400',
          // disabled
          'disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-300',
          '  ',
          // focus
          focusInput,
          // error
          hasError ? hasErrorInput : '',
          // invalid (optional)
          // " aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
