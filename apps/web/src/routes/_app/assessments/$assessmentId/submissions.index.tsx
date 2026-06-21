import { createFileRoute } from '@tanstack/react-router';
import { AssessmentSubmissionsTab } from '@/components/assessments/detail/AssessmentSubmissionsTab';

export const Route = createFileRoute('/_app/assessments/$assessmentId/submissions/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();

  return <AssessmentSubmissionsTab assessmentId={assessmentId} />;
}
