import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RoomListView } from '@/components/room-list/RoomListView';

export const DashboardView = () => {
  return (
    <div className='w-full px-4'>
      <DashboardHeader />

      {/* <Overview /> */}

      <div>
        <RoomListView />
      </div>
    </div>
  );
};
