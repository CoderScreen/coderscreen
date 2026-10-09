import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { AssessmentListView } from '@/components/assessments/AssessmentListView';

export const Route = createFileRoute('/_app/assessments/')({
  validateSearch: zodValidator(
    z.object({
      // open the create dialog on load (used after onboarding)
      new: z.boolean().optional(),
    })
  ),
  component: RouteComponent,
});

function RouteComponent() {
  return <AssessmentListView />;
}
