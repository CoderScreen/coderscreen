import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { AssessmentSubmissionsTab } from '@/components/assessments/detail/AssessmentSubmissionsTab';
import { submissionListSearchSchema } from '@/components/assessments/detail/submissionReview';
import { useAssessment } from '@/query/assessment.query';

export const Route = createFileRoute('/_app/assessments/$assessmentId/submissions/')({
  component: RouteComponent,
  validateSearch: zodValidator(submissionListSearchSchema),
});

function RouteComponent() {
  const { assessmentId } = Route.useParams();
  const { filter = 'all', sort = 'recent' } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { assessment } = useAssessment(assessmentId);

  return (
    <AssessmentSubmissionsTab
      assessmentId={assessmentId}
      assessmentStatus={assessment?.status}
      filter={filter}
      sort={sort}
      onListChange={(next) => navigate({ search: (prev) => ({ ...prev, ...next }), replace: true })}
    />
  );
}
