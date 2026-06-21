import { RiLoader4Line } from '@remixicon/react';
import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/questions/QuestionEditor';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/questions/$questionId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId, questionId } = Route.useParams();
  const { assessment, isLoading } = useAssessment(assessmentId);

  const question = assessment?.questions?.find((q: { id: string }) => q.id === questionId);

  if (isLoading || !assessment) {
    return (
      <div className='flex items-center justify-center h-full'>
        <RiLoader4Line className='size-6 text-gray-400 animate-spin' />
      </div>
    );
  }

  // Cast at the boundary: the Hono RPC client erases literal-type narrowing.
  return (
    <QuestionEditor
      context='assessment'
      mode='edit'
      assessmentId={assessmentId}
      question={question as Parameters<typeof QuestionEditor>[0]['question']}
    />
  );
}
