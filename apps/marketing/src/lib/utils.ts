// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cx = (...args: ClassValue[]) => {
  return twMerge(clsx(...args));
};
export const cn = cx;

// Sleep utility function
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  'focus:ring-1',
  // ring color
  'focus:ring-primary/70 focus:dark:ring-neutral-400/30',
  // border color
  'focus:border-primary focus:dark:border-neutral-400',
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  'outline outline-offset-1 outline-0 focus-visible:outline-1',
  // outline color
  'outline-primary/70 dark:outline-neutral-300',
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  'ring-2',
  // border color
  'border-red-500 dark:border-red-700',
  // ring color
  'ring-red-200 dark:ring-red-700/30',
];
