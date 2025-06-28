import { Button } from '@/components/ui/button';

export const TopBar = () => {
  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex items-center gap-4'>
        <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
          + Start Interview
        </Button>
        <Button
          variant='secondary'
          className='border-gray-300 hover:bg-gray-50'
        >
          Schedule Interview
        </Button>
      </div>
    </div>
  );
};
