import { RoomTable } from '@/components/room-list/RoomTable';
import { SmallHeader } from '@/components/ui/heading';
import { useRooms } from '@/query/room.query';
import { useMemo } from 'react';

export const UpcomingInterviews = () => {
  const { rooms: allRooms } = useRooms();

  const rooms = useMemo(
    () => allRooms?.filter((room) => room.status === 'scheduled'),
    [allRooms]
  );

  return (
    <div className=''>
      <SmallHeader>Upcoming Interviews</SmallHeader>
      <RoomTable rooms={rooms ?? []} isLoading={false} />
    </div>
  );
};
