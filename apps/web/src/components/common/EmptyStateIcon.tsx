import { RemixiconComponentType } from '@remixicon/react';

export const EmptyStateIcon = (props: { icon: RemixiconComponentType }) => {
  return (
    <div className='flex flex-col items-center justify-center h-32'>
      {/* Concentric icon rings */}
      <div className='relative flex items-center justify-center'>
        <span className='absolute w-32 h-32 rounded-2xl border-2 border-gray-200/20' />
        <span className='absolute w-24 h-24 rounded-2xl border-2 border-gray-200/50' />
        <span className='absolute w-14 h-14 rounded-2xl border-2 border-gray-200/80' />
        <span className='relative w-14 h-14 flex items-center justify-center bg-white rounded-2xl border-2 border-gray-200/90'>
          <props.icon className='w-8 h-8 text-gray-300' />
        </span>
      </div>
    </div>
  );
};
