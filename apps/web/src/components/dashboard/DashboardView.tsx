import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { GettingStarted } from '@/components/dashboard/GettingStarted';
import { RoomListView } from '@/components/room-list/RoomListView';

export const DashboardView = () => {
  return (
    <div className='w-full px-4'>
      <DashboardHeader />
      <GettingStarted />

      <RoomListView />
    </div>
  );
};
