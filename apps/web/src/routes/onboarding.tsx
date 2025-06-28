import { createFileRoute } from '@tanstack/react-router';
import { OnboardingView } from '@/components/onboarding/OnboardingView';

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent,
});

function RouteComponent() {
  return <OnboardingView />;
}
