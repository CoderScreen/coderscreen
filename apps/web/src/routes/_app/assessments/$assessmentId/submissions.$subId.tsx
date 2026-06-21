import { createFileRoute } from '@tanstack/react-router';
import { SubmissionDetailView } from '@/components/assessments/detail/SubmissionDetailView';

export const Route = createFileRoute('/_app/assessments/$assessmentId/submissions/$subId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { assessmentId, subId } = Route.useParams();

  return <SubmissionDetailView assessmentId={assessmentId} subId={subId} />;
}
