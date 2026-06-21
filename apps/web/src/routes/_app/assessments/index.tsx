import { createFileRoute } from '@tanstack/react-router';
import { AssessmentListView } from '@/components/assessments/AssessmentListView';

export const Route = createFileRoute('/_app/assessments/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AssessmentListView />;
}
