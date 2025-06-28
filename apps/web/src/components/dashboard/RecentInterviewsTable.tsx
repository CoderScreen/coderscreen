import { RoomTable } from '@/components/room-list/RoomTable';
import { useRooms } from '@/query/room.query';
import { SmallHeader } from '@/components/ui/heading';
export const RecentInterviewsTable = () => {
  const { rooms } = useRooms();

  return (
    <div>
      <SmallHeader>Recent Interviews</SmallHeader>
      <RoomTable rooms={rooms ?? []} isLoading={false} />
    </div>
  );
};
