import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { RiAddLine } from '@remixicon/react';

export function DashboardHeader() {
  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Interviews</SmallHeader>
      </div>

      <div className='flex items-center gap-2'>
        <Button icon={RiAddLine}>
          <span>Start Interview</span>
          <div className='flex items-center justify-center bg-white/20 text-white/70 px-1.5 rounded ml-1'>
            S
          </div>
        </Button>
      </div>
    </div>
  );
}
