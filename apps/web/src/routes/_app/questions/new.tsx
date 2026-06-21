import { createFileRoute } from '@tanstack/react-router';
import { QuestionEditor } from '@/components/questions/QuestionEditor';

export const Route = createFileRoute('/_app/questions/new')({
  component: RouteComponent,
});

function RouteComponent() {
  return <QuestionEditor context='library' mode='create' />;
}
