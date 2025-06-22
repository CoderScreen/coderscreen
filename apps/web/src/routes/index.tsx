import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RoomTable } from '@/components/dashboard/RoomTable';
import {
  RoomFilters,
  filterRooms,
  type RoomFilters as RoomFiltersType,
} from '@/components/dashboard/RoomFilters';
import { useRooms } from '@/query/room.query';

export const Route = createFileRoute('/')({
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
    <div className='flex h-screen text-gray-800'>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        <DashboardHeader />
        <main className='flex-1 overflow-auto px-4'>
          <div className='space-y-6'>
            <RoomFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalRooms={rooms?.length ?? 0}
              filteredRooms={filteredRooms.length}
            />
            <RoomTable rooms={filteredRooms} />
          </div>
        </main>
      </div>
    </div>
  );
}
