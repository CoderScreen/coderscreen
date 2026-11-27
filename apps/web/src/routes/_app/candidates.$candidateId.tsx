import { createFileRoute } from '@tanstack/react-router';
import { CandidateDetailView } from '@/components/candidates/CandidateDetailView';

export const Route = createFileRoute('/_app/candidates/$candidateId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { candidateId } = Route.useParams();
  return <CandidateDetailView candidateId={candidateId} />;
}
