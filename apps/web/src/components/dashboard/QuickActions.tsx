import {
  RemixiconComponentType,
  RiAddLine,
  RiFileList3Line,
  RiUserAddLine,
} from '@remixicon/react';
import { cx, focusRing } from '@/lib/utils';

interface QuickAction {
  key: string;
  label: string;
  description: string;
  icon: RemixiconComponentType;
}

const ACTIONS: QuickAction[] = [
  {
    key: 'new_interview',
    label: 'New interview',
    description: 'Start a live coding session',
    icon: RiAddLine,
  },
  {
    key: 'new_assessment',
    label: 'New assessment',
    description: 'Build an async take-home',
    icon: RiFileList3Line,
  },
  {
    key: 'invite_candidate',
    label: 'Invite candidate',
    description: 'Send an assessment link',
    icon: RiUserAddLine,
  },
];

export const QuickActions = () => {
  return (
    <div className='flex flex-col rounded-lg border border-gray-200 bg-white'>
      <div className='border-b border-gray-200 px-4 py-3'>
        <h3 className='text-sm font-medium text-gray-900'>Quick actions</h3>
      </div>

      <div className='p-2'>
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            type='button'
            className={cx(
              'group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50 cursor-pointer',
              focusRing
            )}
          >
            <div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-white'>
              <action.icon className='size-4.5' aria-hidden='true' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-medium text-gray-900'>{action.label}</p>
              <p className='text-xs text-muted-foreground'>{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
