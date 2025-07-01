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
import { DashboardView } from '@/components/dashboard/DashboardView';

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardView />;
}
