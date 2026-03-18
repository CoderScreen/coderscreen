import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router';
import { AssessmentDetailView } from '@/components/assessments/detail/AssessmentDetailView';

export const Route = createFileRoute('/_app/assessments/$assessmentId')({
  component: RouteComponent,
});

function RouteComponent() {
  const newMatch = useMatch({ from: '/_app/assessments/$assessmentId/questions/new', shouldThrow: false });
  const editMatch = useMatch({ from: '/_app/assessments/$assessmentId/questions/$questionId/edit', shouldThrow: false });
  const hasChildRoute = !!newMatch || !!editMatch;

  if (hasChildRoute) {
    return <Outlet />;
  }

  return <AssessmentDetailView />;
}
