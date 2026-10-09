import { Button } from '@coderscreen/ui/button';
import { RiCloseLine, RiLinkM } from '@remixicon/react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useRoom } from '@/query/room.query';

const STEPS = [
  {
    title: 'Run some code',
    description: 'Write anything in the editor and hit Run to see the output.',
  },
  {
    title: 'See the candidate view',
    description: 'Open the candidate link in a private window and type in both.',
  },
  {
    title: 'Send it to a real candidate',
    description: 'They join from the link. No account or download needed.',
  },
];

// Shown once, right after onboarding drops the user into their first room
export const FirstRoomWelcome = () => {
  const { welcome } = useSearch({ from: '/room/$roomId/' });
  const navigate = useNavigate({ from: '/room/$roomId' });
  const { room } = useRoom();

  if (!welcome || !room) {
    return null;
  }

  const dismiss = () => navigate({ search: {}, replace: true });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`);
      toast.success('Candidate link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className='fixed bottom-16 right-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg'>
      <div className='flex items-start justify-between gap-2 mb-3'>
        <p className='text-sm font-medium text-gray-900'>Your interview room is ready</p>
        <button
          type='button'
          onClick={dismiss}
          aria-label='Dismiss'
          className='text-muted-foreground hover:text-gray-900 cursor-pointer'
        >
          <RiCloseLine className='size-4' />
        </button>
      </div>

      <ol className='space-y-3 mb-4'>
        {STEPS.map((step, i) => (
          <li key={step.title} className='flex gap-3'>
            <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
              {i + 1}
            </span>
            <div>
              <p className='text-sm text-gray-900'>{step.title}</p>
              <p className='text-xs text-muted-foreground'>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className='flex gap-2'>
        <Button variant='secondary' icon={RiLinkM} className='flex-1' onClick={handleCopyLink}>
          Copy candidate link
        </Button>
        <Button variant='ghost' onClick={dismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
};
