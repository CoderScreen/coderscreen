import { AssessmentListHeader } from '@/components/assessments/AssessmentListHeader';
import { AssessmentTable } from '@/components/assessments/AssessmentTable';
import { GettingStarted } from '@/components/dashboard/GettingStarted';

export const AssessmentListView = () => {
  return (
    <div className='w-full px-4'>
      <AssessmentListHeader />
      <GettingStarted />
      <AssessmentTable />
    </div>
  );
};
