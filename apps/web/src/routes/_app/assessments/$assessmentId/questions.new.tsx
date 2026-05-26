import { RiLoader4Line } from '@remixicon/react';
import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/assessments/detail/QuestionEditor';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/questions/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const { assessment, isLoading } = useAssessment(assessmentId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <RiLoader4Line className='size-6 text-gray-400 animate-spin' />
      </div>
    );
  }

  const nextPosition = assessment?.questions?.length ?? 0;

  return <QuestionEditor assessmentId={assessmentId} mode='create' nextPosition={nextPosition} />;
}
