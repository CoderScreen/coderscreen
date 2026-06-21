import { QuestionLibraryListHeader } from '@/components/questions/QuestionLibraryListHeader';
import { QuestionLibraryTable } from '@/components/questions/QuestionLibraryTable';

export const QuestionLibraryListView = () => {
  return (
    <div className='w-full px-4'>
      <QuestionLibraryListHeader />
      <QuestionLibraryTable />
    </div>
  );
};
