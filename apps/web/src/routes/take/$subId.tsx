import { createFileRoute } from '@tanstack/react-router';
import { TakeAssessmentView } from '@/components/take/TakeAssessmentView';

export const Route = createFileRoute('/take/$subId')({
  beforeLoad: async () => {
    // Public route — no auth required
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <TakeAssessmentView />;
}
