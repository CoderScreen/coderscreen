import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiAddLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiLock2Line,
} from '@remixicon/react';
import { useState } from 'react';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { useDeleteTestCase } from '@/query/assessment.query';
import { TestCaseDialog } from './TestCaseDialog';

interface TestCase {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  position: number;
}

interface TestCasesListProps {
  testCases: TestCase[];
  assessmentId: string;
  questionId: string;
}

export const TestCasesList = ({ testCases, assessmentId, questionId }: TestCasesListProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const { deleteTestCase } = useDeleteTestCase(assessmentId, questionId);

  const sortedTestCases = [...testCases].sort((a, b) => a.position - b.position);

  return (
    <div className='space-y-2'>
      {sortedTestCases.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center py-8 space-y-3'>
          <EmptyStateIcon icon={RiCheckboxCircleLine} />
          <div>
            <p className='text-sm font-medium text-gray-900'>No test cases yet</p>
            <MutedText className='text-sm'>Add test cases to validate solutions.</MutedText>
          </div>
          <Button
            type='button'
            variant='secondary'
            icon={RiAddLine}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Test Case
          </Button>
        </div>
      ) : (
        <>
          {sortedTestCases.map((tc, index) => (
            <div
              key={tc.id}
              className='flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50'
            >
              <div className='flex items-center gap-2 min-w-0'>
                <span className='text-xs font-semibold text-gray-400 shrink-0'>{index + 1}</span>
                <span className='text-sm text-gray-900 truncate'>
                  {tc.label || `Test case ${index + 1}`}
                </span>
                {tc.isHidden && (
                  <Badge variant='warning'>
                    <RiLock2Line className='size-3.5' /> Hidden
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-1 shrink-0'>
                <Button
                  type='button'
                  variant='ghost'
                  className='p-1'
                  onClick={() => setEditingTestCase(tc)}
                >
                  <RiEdit2Line className='size-3.5' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  className='p-1 text-red-500 hover:text-red-600'
                  onClick={() => deleteTestCase(tc.id)}
                >
                  <RiDeleteBinLine className='size-3.5' />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type='button'
            variant='ghost'
            icon={RiAddLine}
            className='w-full border border-dashed border-gray-300 hover:border-gray-400 text-gray-500'
            onClick={() => setAddDialogOpen(true)}
          >
            Add Test Case
          </Button>
        </>
      )}

      <TestCaseDialog
        mode='create'
        assessmentId={assessmentId}
        questionId={questionId}
        nextPosition={sortedTestCases.length}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {editingTestCase && (
        <TestCaseDialog
          mode='edit'
          assessmentId={assessmentId}
          questionId={questionId}
          testCase={editingTestCase}
          open={!!editingTestCase}
          onOpenChange={(open) => {
            if (!open) setEditingTestCase(null);
          }}
        />
      )}
    </div>
  );
};
