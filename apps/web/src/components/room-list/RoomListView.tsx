import { RoomTable } from '@/components/room-list/RoomTable';
import { useRooms } from '@/query/room.query';
import { filterRooms, RoomFilters } from '@/components/room-list/RoomFilters';
import { useMemo, useState } from 'react';

export function RoomListView() {
  const { rooms, isLoading } = useRooms();

  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    language: '*',
    dateRange: '*',
    status: '*',
    sortField: 'createdAt',
    sortDirection: 'desc',
  });

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return filterRooms(rooms, filters);
  }, [rooms, filters]);

  return (
    <>
      <RoomFilters filters={filters} onFiltersChange={setFilters} />
      <RoomTable rooms={filteredRooms} isLoading={isLoading} noRooms={rooms?.length === 0} />
    </>
  );
}
