import { RoomTable } from '@/components/room-list/RoomTable';
import { RoomListHeader } from '@/components/room-list/RoomListHeader';
import { useRooms } from '@/query/room.query';
import { RoomFilters } from '@/components/room-list/RoomFilters';
import { useState } from 'react';

export function RoomListView() {
  const { rooms, isLoading } = useRooms();

  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    language: '',
    dateRange: 'all',
  });

  return (
    <div className='w-full'>
      <RoomListHeader />

      <RoomFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => {}}
        totalRooms={0}
        filteredRooms={0}
      />
      <RoomTable rooms={rooms ?? []} isLoading={isLoading} />
    </div>
  );
}
