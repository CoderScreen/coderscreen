import { DashboardView } from '@/components/dashboard/DashboardView';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/rooms')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardView />;
}
