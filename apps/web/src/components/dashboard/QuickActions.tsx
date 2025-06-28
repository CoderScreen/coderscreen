import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { useCreateRoom } from '@/query/room.query';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import {
  RiAddLine,
  RiCodeBoxLine,
  RiTerminalLine,
  RiBrainLine,
  RiDatabaseLine,
  RiLayoutLine,
  RiServerLine,
  RiCalendar2Line,
  RiArrowDownSLine,
  RiFlashlightLine,
  RiEyeLine,
} from '@remixicon/react';

export const QuickActions = () => {
  // const { createRoom, isLoading } = useCreateRoom();

  const handleCreateRoom = async () => {
    //
  };

  return (
    <div className='w-full'>
      {/* Action Buttons */}
      <div className='flex gap-2 mb-4'>
        <Button onClick={handleCreateRoom} className='flex-1'>
          <RiAddLine className='w-4 h-4 mr-1' />
          Start
        </Button>
        <Button
          onClick={handleCreateRoom}
          variant='secondary'
          className='flex-1'
        >
          <RiCalendar2Line className='w-4 h-4 mr-1' />
          Schedule
        </Button>
        <Button variant='secondary' className='px-3'>
          <RiArrowDownSLine className='w-4 h-4' />
          More
        </Button>
      </div>

      {/* Divider */}
      <div className='border-t mb-4'></div>

      {/* Usage Stats */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-muted-foreground'>Usage: 12/20</span>
          <div className='flex gap-1'>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-sm ${
                  i < 6 ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Last Activity */}
        <div className='flex justify-between items-center'>
          <span className='text-sm text-muted-foreground'>
            Last: Alex (2d ago)
          </span>
          <Button
            variant='ghost'
            className='h-auto p-0 text-primary hover:text-primary'
          >
            <span className='text-sm'>View</span>
            <RiEyeLine className='w-3 h-3 ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
};
