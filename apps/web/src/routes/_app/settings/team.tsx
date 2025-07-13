import { createFileRoute } from '@tanstack/react-router';
import { TeamView } from '@/components/settings/TeamView';

export const Route = createFileRoute('/_app/settings/team')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TeamView />;
}
