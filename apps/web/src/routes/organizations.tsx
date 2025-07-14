import { createFileRoute } from '@tanstack/react-router';
import { ChooseOrgView } from '@/components/org/ChooseOrgView';

export const Route = createFileRoute('/organizations')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChooseOrgView />;
}
