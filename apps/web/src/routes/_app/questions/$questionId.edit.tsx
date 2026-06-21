import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/questions/QuestionEditor';
import { useQuestionLibraryItem } from '@/query/questionLibrary.query';

export const Route = createFileRoute('/_app/questions/$questionId/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  const { questionId } = Route.useParams();
  const { question, isLoading } = useQuestionLibraryItem(questionId);

  if (isLoading) {
    return <div className='w-full px-4 py-8 text-center text-gray-500'>Loading...</div>;
  }

  if (!question) {
    return <div className='w-full px-4 py-8 text-center text-gray-500'>Question not found</div>;
  }

  // Cast at the boundary: the Hono RPC client erases literal-type narrowing.
  // Runtime shape matches the editor's `question` prop.
  return (
    <QuestionEditor
      context='library'
      mode='edit'
      question={question as Parameters<typeof QuestionEditor>[0]['question']}
    />
  );
}
