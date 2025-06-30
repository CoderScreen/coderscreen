import { createFileRoute, redirect } from '@tanstack/react-router';
import { OnboardingView } from '@/components/onboarding/OnboardingView';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context }) => {
    const { user } = await context.auth;

    // if (user?.isOnboarded) {
    //   return redirect({ to: '/' });
    // }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <OnboardingView />;
}
