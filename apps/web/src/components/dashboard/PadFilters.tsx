import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select';
import {
  RiSearchLine,
  RiFilter3Line,
  RiCloseLine,
  RiCalendarLine,
  RiCodeBoxLine,
} from '@remixicon/react';
import { Button } from '../ui/button';

export default function PadFilters() {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h2 className='text-xl font-bold text-gray-900'>Recent Activity</h2>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='light' className='text-gray-600'>
          <RiFilter3Line className='-ml-1 mr-2 size-4' />
          Filter
        </Button>
        <Button variant='light' className='text-gray-600'>
          <RiFilter3Line className='-ml-1 mr-2 size-4' />
          Sort
        </Button>
      </div>
    </div>
  );
}
