import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RoomTable } from '@/components/dashboard/RoomTable';

export const DashboardView = () => {
  return (
    <div>
      <DashboardHeader />
      <RoomTable rooms={[]} isLoading={false} />
    </div>
  );
};
