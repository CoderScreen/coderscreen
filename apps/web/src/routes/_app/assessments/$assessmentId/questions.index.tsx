import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AssessmentQuestionsTab } from '@/components/assessments/detail/AssessmentQuestionsTab';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/questions/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const [questionsPage, setQuestionsPage] = useState(1);
  const { assessment } = useAssessment(assessmentId, questionsPage);

  if (!assessment) return null;

  return (
    <AssessmentQuestionsTab assessment={assessment} onQuestionsPageChange={setQuestionsPage} />
  );
}
