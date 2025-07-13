import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/settings/api-keys')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/settings/api-keys"!</div>;
}
