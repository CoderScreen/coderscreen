import { createFileRoute } from '@tanstack/react-router';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardView />;
}
