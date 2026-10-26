import { createFileRoute } from '@tanstack/react-router';
import { AssessmentSubmissionsTab } from '@/components/assessments/detail/AssessmentSubmissionsTab';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/submissions/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const { assessment } = useAssessment(assessmentId);

  return (
    <AssessmentSubmissionsTab assessmentId={assessmentId} assessmentStatus={assessment?.status} />
  );
}
