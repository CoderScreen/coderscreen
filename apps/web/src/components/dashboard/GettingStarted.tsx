import { RiCheckboxBlankCircleLine, RiCheckboxCircleFill, RiCloseLine } from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { cx } from '@/lib/utils';
import { useAssessments, useCandidates } from '@/query/assessment.query';
import { useActiveOrg } from '@/query/org.query';
import { useRooms } from '@/query/room.query';
import { useInvitations } from '@/query/team.query';

const dismissKey = (orgId: string) => `getting-started-dismissed:${orgId}`;

// Short checklist that walks a new org to its first real candidate
export const GettingStarted = () => {
  const { org } = useActiveOrg();
  const { rooms } = useRooms();
  const { pagination } = useAssessments(1, 1);
  const { candidates } = useCandidates();
  const { invitations } = useInvitations();

  const [dismissed, setDismissed] = useState(
    () => !!org && localStorage.getItem(dismissKey(org.id)) === 'true'
  );

  if (!org || !rooms || !pagination || !candidates || !invitations) {
    return null;
  }

  if (dismissed || localStorage.getItem(dismissKey(org.id)) === 'true') {
    return null;
  }

  const steps = [
    {
      title: 'Create an interview or assessment',
      description: 'Start a live room, or build a test that grades itself.',
      done: rooms.length > 0 || pagination.totalCount > 0,
    },
    {
      title: 'Send it to a candidate',
      description: 'Share an interview link or invite someone to an assessment.',
      done: candidates.length > 0 || rooms.some((room) => room.status === 'completed'),
    },
    {
      title: 'Invite a teammate',
      description: 'Bring in the people who interview with you.',
      done: (org.members?.length ?? 0) > 1 || invitations.length > 0,
      action: (
        <Link to='/settings/team' className='text-sm font-medium text-primary hover:underline'>
          Invite
        </Link>
      ),
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  if (doneCount === steps.length) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(dismissKey(org.id), 'true');
    setDismissed(true);
  };

  return (
    <div className='mb-4 rounded-lg border border-gray-200 bg-white'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
        <div>
          <h3 className='text-sm font-medium text-gray-900'>Get to your first candidate</h3>
          <p className='text-xs text-muted-foreground'>
            {doneCount} of {steps.length} done
          </p>
        </div>
        <button
          type='button'
          onClick={handleDismiss}
          aria-label='Dismiss'
          className='text-muted-foreground hover:text-gray-900 cursor-pointer'
        >
          <RiCloseLine className='size-4' />
        </button>
      </div>

      <ul className='divide-y divide-gray-100'>
        {steps.map((step) => (
          <li key={step.title} className='flex items-center gap-3 px-4 py-3'>
            {step.done ? (
              <RiCheckboxCircleFill className='size-5 shrink-0 text-green-600' />
            ) : (
              <RiCheckboxBlankCircleLine className='size-5 shrink-0 text-gray-300' />
            )}
            <div className='min-w-0 flex-1'>
              <p
                className={cx(
                  'text-sm',
                  step.done ? 'text-muted-foreground line-through' : 'text-gray-900'
                )}
              >
                {step.title}
              </p>
              {!step.done && <p className='text-xs text-muted-foreground'>{step.description}</p>}
            </div>
            {!step.done && step.action}
          </li>
        ))}
      </ul>
    </div>
  );
};
