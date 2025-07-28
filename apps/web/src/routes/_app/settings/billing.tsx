import { createFileRoute } from '@tanstack/react-router';
import { BillingView } from '@/components/settings/BillingView';

export const Route = createFileRoute('/_app/settings/billing')({
  component: RouteComponent,
});

function RouteComponent() {
  return <BillingView />;
}
