import { createFileRoute, redirect } from '@tanstack/react-router';
import { ChooseOrgView } from '@/components/org/ChooseOrgView';

export const Route = createFileRoute('/organizations')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const { user, isAuthenticated } = await context.auth; // Call the function

    if (!isAuthenticated || !user) {
      throw redirect({ to: '/login', search: { callbackUrl: location.href } });
    }
  },
});

function RouteComponent() {
  return <ChooseOrgView />;
}
