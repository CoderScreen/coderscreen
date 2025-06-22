import { Button } from '../ui/button';
import {
  RiMenuLine,
  RiNotification3Line,
  RiSettings3Line,
  RiAddLine,
  RiSearchLine,
} from '@remixicon/react';

export default function Header() {
  return (
    <div className='flex items-center justify-between'>
      {/* Search bar */}
      <div className='flex-1 max-w-lg'>
        <div className='relative'>
          <RiSearchLine className='absolute left-3.5 top-1/2 transform -translate-y-1/2 size-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search pads, interviews...'
            className='w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all'
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className='flex items-center gap-4 ml-8'>
        <Button className='bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2'>
          <RiAddLine className='size-5' />
          Create Pad
        </Button>
      </div>
    </div>
  );
}
