import { CandidateListHeader } from '@/components/candidates/CandidateListHeader';
import { CandidateTable } from '@/components/candidates/CandidateTable';

export const CandidateListView = () => {
  return (
    <div className='w-full px-4'>
      <CandidateListHeader />
      <CandidateTable />
    </div>
  );
};
