import { createFileRoute, redirect } from '@tanstack/react-router';
import { AcceptInvitationView } from '@/components/invitations/AccInvView';

export const Route = createFileRoute('/accept-invitation/$invId')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const { user, isAuthenticated } = await context.auth; // Call the function

    if (!isAuthenticated || !user) {
      throw redirect({ to: '/login', search: { callbackUrl: location.href } });
    }
  },
});

function RouteComponent() {
  return <AcceptInvitationView />;
}
