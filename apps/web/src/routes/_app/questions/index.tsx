import { createFileRoute } from '@tanstack/react-router';
import { QuestionLibraryListView } from '@/components/questions/QuestionLibraryListView';

export const Route = createFileRoute('/_app/questions/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <QuestionLibraryListView />;
}
