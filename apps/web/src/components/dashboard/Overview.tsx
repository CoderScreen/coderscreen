import { RiArrowRightLine, RiSkipRightFill } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';

export const Overview = () => {
  // Placeholder data
  const nextInterview = {
    roomTitle: 'Frontend Developer Interview',
    time: '2:30PM',
    roomId: 'room-123',
  };

  const handleJoinInterview = () => {
    window.location.href = `/room/${nextInterview.roomId}`;
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div>
        <div className='flex flex-col gap-4 bg-muted rounded-lg p-6'>
          <div className='flex items-center gap-2'>
            <div className='bg-primary rounded p-1'>
              <RiSkipRightFill className='text-white size-6' />
            </div>
            <SmallHeader className='text-lg'>Upcoming Interview</SmallHeader>
          </div>

          <div className='flex justify-between items-center'>
            <div className='space-y-2'>
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-primary'>{nextInterview.roomTitle}</span>
              </div>
              <div className='text-sm text-muted-foreground'>@ {nextInterview.time}</div>
            </div>

            <div>
              <Button onClick={handleJoinInterview} icon={RiArrowRightLine} iconPosition='right'>
                Join Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
