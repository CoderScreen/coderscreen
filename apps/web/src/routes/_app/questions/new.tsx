import { createFileRoute } from '@tanstack/react-router';
import { QuestionLibraryEditor } from '@/components/questions/QuestionLibraryEditor';

export const Route = createFileRoute('/_app/questions/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <QuestionLibraryEditor mode='create' />;
}
