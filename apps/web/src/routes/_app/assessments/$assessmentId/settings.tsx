import { createFileRoute } from '@tanstack/react-router';
import { AssessmentSettingsTab } from '@/components/assessments/detail/AssessmentSettingsTab';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const { assessment } = useAssessment(assessmentId);

  if (!assessment) return null;

  return <AssessmentSettingsTab assessment={assessment} />;
}
