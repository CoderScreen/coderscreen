import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { SubmissionDetailView } from '@/components/assessments/detail/SubmissionDetailView';
import { submissionListSearchSchema } from '@/components/assessments/detail/submissionReview';

export const Route = createFileRoute('/_app/assessments/$assessmentId/submissions/$subId')({
  component: RouteComponent,
  validateSearch: zodValidator(submissionListSearchSchema),
});

function RouteComponent() {
  const { assessmentId, subId } = Route.useParams();
  const { filter = 'all', sort = 'recent' } = Route.useSearch();

  return (
    <SubmissionDetailView assessmentId={assessmentId} subId={subId} filter={filter} sort={sort} />
  );
}
