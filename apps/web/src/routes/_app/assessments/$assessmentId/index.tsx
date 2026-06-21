import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/assessments/$assessmentId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/assessments/$assessmentId/questions',
      params: { assessmentId: params.assessmentId },
    });
  },
});
