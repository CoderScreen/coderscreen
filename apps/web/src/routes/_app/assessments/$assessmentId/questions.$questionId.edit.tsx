import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/assessments/detail/QuestionEditor';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/questions/$questionId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId, questionId } = Route.useParams();
  const { assessment } = useAssessment(assessmentId);

  const question = assessment?.questions?.find((q: { id: string }) => q.id === questionId);

  if (!assessment) {
    return null;
  }

  return <QuestionEditor assessmentId={assessmentId} mode='edit' question={question} />;
}
