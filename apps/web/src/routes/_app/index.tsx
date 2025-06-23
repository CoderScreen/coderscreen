import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RoomTable } from '@/components/room-list/RoomTable';
import {
  RoomFilters,
  filterRooms,
  type RoomFilters as RoomFiltersType,
} from '@/components/room-list/RoomFilters';
import { useRooms } from '@/query/room.query';

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { rooms } = useRooms();

  // Initialize filters state
  const [filters, setFilters] = useState<RoomFiltersType>({
    search: '',
    language: '',
    dateRange: 'all',
  });

  // Filter rooms based on current filters
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return filterRooms(rooms, filters);
  }, [rooms, filters]);

  const handleFiltersChange = (newFilters: RoomFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      language: '',
      dateRange: 'all',
    });
  };

  return (
    <div className='w-full'>
      <DashboardHeader />
      <main className='flex-1 overflow-auto px-4'>
        <div className='space-y-6'>
          <RoomFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            totalRooms={5}
            filteredRooms={filteredRooms.length}
          />
          <RoomTable rooms={filteredRooms} />
        </div>
      </main>
    </div>
  );
}
