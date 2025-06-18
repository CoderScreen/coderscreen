// Tremor Raw Input [v1.0.0]

import React from 'react';
import { RiEyeFill, RiEyeOffFill, RiSearchLine } from '@remixicon/react';
import { tv, type VariantProps } from 'tailwind-variants';

import {
  cx,
  focusInput,
  focusRing,
  hasErrorInput,
} from '@/components/ui/lib/utils';

const inputStyles = tv({
  base: [
    // base
    'relative block w-full appearance-none rounded-md border px-2.5 py-1.5 shadow-sm outline-none transition sm:text-sm',
    // border color
    'border-stone-300 dark:border-stone-800',
    // text color
    'text-stone-900 dark:text-stone-50',
    // placeholder color
    'placeholder-stone-400 dark:placeholder-stone-500',
    // background color
    'bg-white dark:bg-stone-950',
    // disabled
    'disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-400',
    'disabled:dark:border-stone-700 disabled:dark:bg-stone-800 disabled:dark:text-stone-500',
    // file
    [
      'file:-my-1.5 file:-ml-2.5 file:h-[36px] file:cursor-pointer file:rounded-l-md file:rounded-r-none file:border-0 file:px-3 file:py-1.5 file:outline-none focus:outline-none disabled:pointer-events-none file:disabled:pointer-events-none',
      'file:border-solid file:border-stone-300 file:bg-stone-50 file:text-stone-500 file:hover:bg-stone-100 file:dark:border-stone-800 file:dark:bg-stone-950 file:hover:dark:bg-stone-900/20 file:disabled:dark:border-stone-700',
      'file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem]',
      'file:disabled:bg-stone-100 file:disabled:text-stone-500 file:disabled:dark:bg-stone-800',
    ],
    // focus
    focusInput,
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
    // remove search cancel button (optional)
    '[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
    // number input
    enableStepper: {
      true: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    },
  },
});

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  inputClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      hasError,
      enableStepper,
      type,
      ...props
    }: InputProps,
    forwardedRef
  ) => {
    const [typeState, setTypeState] = React.useState(type);

    const isPassword = type === 'password';
    const isSearch = type === 'search';

    return (
      <div className={cx('relative w-full', className)}>
        <input
          ref={forwardedRef}
          type={isPassword ? typeState : type}
          className={cx(
            inputStyles({ hasError, enableStepper }),
            {
              'pl-8': isSearch,
              'pr-10': isPassword,
            },
            inputClassName
          )}
          {...props}
        />
        {isSearch && (
          <div
            className={cx(
              // base
              'pointer-events-none absolute bottom-0 left-2 flex h-full items-center justify-center',
              // text color
              'text-stone-400 dark:text-stone-600'
            )}
          >
            <RiSearchLine
              className='size-[1.125rem] shrink-0'
              aria-hidden='true'
            />
          </div>
        )}
        {isPassword && (
          <div
            className={cx(
              'absolute bottom-0 right-0 flex h-full items-center justify-center px-3'
            )}
          >
            <button
              aria-label='Change password visibility'
              className={cx(
                // base
                'h-fit w-fit rounded-sm outline-none transition-all',
                // text
                'text-stone-400  dark:text-stone-600',
                // hover
                'hover:text-stone-500 hover:dark:text-stone-500',
                focusRing
              )}
              type='button'
              onClick={() => {
                setTypeState(typeState === 'password' ? 'text' : 'password');
              }}
            >
              <span className='sr-only'>
                {typeState === 'password' ? 'Show password' : 'Hide password'}
              </span>
              {typeState === 'password' ? (
                <RiEyeFill aria-hidden='true' className='size-5 shrink-0' />
              ) : (
                <RiEyeOffFill aria-hidden='true' className='size-5 shrink-0' />
              )}
            </button>
          </div>
        )}
      </div>
    );
  }
);

export { Input, inputStyles, type InputProps };
