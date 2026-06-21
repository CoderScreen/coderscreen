import { createFileRoute } from '@tanstack/react-router';
import { AssessmentCodingView } from '@/components/take/AssessmentCodingView';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useCurrentQuestionId } from '@/lib/params';

export const Route = createFileRoute('/take/$subId/question/$questionId')({
  component: RouteComponent,
});

function RouteComponent() {
  const questionId = useCurrentQuestionId();
  const { assessment } = useTakeAssessment();

  const question = assessment?.questions?.find((q) => q.id === questionId);

  if (!question) return null;

  return <AssessmentCodingView question={question} />;
}
