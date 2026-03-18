import { AssessmentListHeader } from '@/components/assessments/AssessmentListHeader';
import { AssessmentTable } from '@/components/assessments/AssessmentTable';

export const AssessmentListView = () => {
  return (
    <div className='w-full px-4'>
      <AssessmentListHeader />
      <AssessmentTable />
    </div>
  );
};
