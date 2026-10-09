import { RiLoader4Line } from '@remixicon/react';
import { useEffect, useState } from 'react';
import type { LspStatus } from './LspSession';

// Most servers are ready in well under a second; only show the slow ones.
const SHOW_AFTER_MS = 1000;

/**
 * Says the room's language server is still loading, so a candidate who types
 * before it's ready (rust-analyzer takes a while) knows suggestions are coming.
 */
export const LspStatusIndicator = ({ status }: { status: LspStatus }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (!visible) return null;

  return (
    <div className='pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-md border border-gray-200 bg-white/90 px-3 py-1.5 text-sm text-gray-500 shadow-sm'>
      <RiLoader4Line className='size-4 animate-spin' />
      Loading autocomplete
    </div>
  );
};
