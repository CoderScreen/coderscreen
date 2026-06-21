import { createFileRoute } from '@tanstack/react-router';
import { AssessmentHeader } from '@/components/take/AssessmentHeader';
import { QuestionsOverview } from '@/components/take/QuestionsOverview';

export const Route = createFileRoute('/take/$subId/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='h-screen flex flex-col bg-white'>
      <AssessmentHeader mode='overview' />
      <QuestionsOverview />
    </div>
  );
}
