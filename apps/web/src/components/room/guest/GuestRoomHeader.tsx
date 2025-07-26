import { Skeleton } from '@/components/ui/skeleton';
import { usePublicRoom } from '@/query/publicRoom.query';

export const GuestRoomHeader = () => {
  const { publicRoom, isLoading } = usePublicRoom();

  return (
    <div className='flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-2'>
        <div className='max-w-80'>
          {isLoading ? (
            <Skeleton className='w-42 h-6' />
          ) : (
            <span className='w-full text-lg cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap'>
              {publicRoom?.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
