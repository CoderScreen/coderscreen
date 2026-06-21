import { createFileRoute } from '@tanstack/react-router';
import { CandidateListView } from '@/components/candidates/CandidateListView';

export const Route = createFileRoute('/_app/candidates')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CandidateListView />;
}
