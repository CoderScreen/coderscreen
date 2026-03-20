import { createFileRoute } from '@tanstack/react-router';
import { QuestionLibraryEditor } from '@/components/questions/QuestionLibraryEditor';
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

  return (
    <QuestionLibraryEditor
      mode='edit'
      question={question}
    />
  );
}
