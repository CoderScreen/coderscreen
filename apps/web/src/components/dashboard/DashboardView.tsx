import { UpcomingInterviews } from '@/components/dashboard/UpcomingInterviews';
import { RecentInterviewsTable } from '@/components/dashboard/RecentInterviewsTable';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Overview } from '@/components/dashboard/Overview';
import { RoomTable } from '@/components/room-list/RoomTable';
import { useRooms } from '@/query/room.query';
import { RoomListView } from '@/components/room-list/RoomListView';
import { Card } from '@/components/ui/card';

export const DashboardView = () => {
  return (
    <div className='w-full px-4'>
      <DashboardHeader />

      <Overview />

      <div className='mt-8 '>
        <RoomListView />
      </div>
    </div>
  );
};
