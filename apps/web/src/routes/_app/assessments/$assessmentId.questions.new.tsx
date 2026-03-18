import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/assessments/detail/QuestionEditor';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/questions/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const { assessment } = useAssessment(assessmentId);

  const nextPosition = assessment?.questions?.length ?? 0;

  return <QuestionEditor assessmentId={assessmentId} mode='create' nextPosition={nextPosition} />;
}
