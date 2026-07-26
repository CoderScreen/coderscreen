import { createFileRoute } from '@tanstack/react-router';
import { ApiKeysView } from '@/components/settings/ApiKeysView';

export const Route = createFileRoute('/_app/settings/api-keys')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ApiKeysView />;
}
