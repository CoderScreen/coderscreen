import { RiCommandLine } from '@remixicon/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Shortcut = (props: { cmd?: boolean; _key: ReactNode; variant?: 'light' | 'dark' }) => {
  const { cmd, _key, variant = 'light' } = props;

  return (
    <div
      className={cn(
        'flex items-center justify-center px-1.5 py-0.5 rounded ml-1 gap-1',
        variant === 'light' ? 'bg-white/20 text-white/70' : 'bg-black/20 text-gray-500'
      )}
    >
      {cmd && <RiCommandLine className='size-3' />}
      <span className='text-xs tracking-wide'>{_key}</span>
    </div>
  );
};
