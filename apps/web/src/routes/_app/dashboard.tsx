import { createFileRoute } from '@tanstack/react-router';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardOverview />;
}
