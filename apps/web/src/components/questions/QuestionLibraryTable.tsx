import { Button } from '@coderscreen/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { SmallHeader } from '@coderscreen/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
  TableSkeleton,
} from '@coderscreen/ui/table';
import { Tooltip } from '@coderscreen/ui/tooltip';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine, RiDeleteBinLine, RiFileTextLine, RiMore2Line } from '@remixicon/react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import {
  type QuestionLibraryItem,
  useDeleteQuestionLibrary,
  useQuestionLibrary,
} from '@/query/questionLibrary.query';

const RowActions = ({ question }: { question: QuestionLibraryItem }) => {
  const { deleteQuestion, isLoading } = useDeleteQuestionLibrary();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    await deleteQuestion(question.id);
    setDeleteOpen(false);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops the parent row's click from firing; it is not itself an interactive control
    // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper has no keyboard semantics of its own
    <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='icon' icon={RiMore2Line} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-red-600 focus:text-red-600 focus:bg-red-50'
          >
            <DropdownMenuIconWrapper className='text-red-600'>
              <RiDeleteBinLine className='size-4' />
            </DropdownMenuIconWrapper>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title='Delete Question'
        description='Are you sure you want to delete this question? This will also delete all associated test cases. This action cannot be undone.'
        isLoading={isLoading}
      />
    </div>
  );
};

export function QuestionLibraryTable() {
  const { questions, isLoading } = useQuestionLibrary();
  const navigate = useNavigate();
  const noQuestions = questions?.length === 0;

  return (
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Times Taken</TableHeaderCell>
            <TableHeaderCell>Avg Score</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton numRows={10} numCols={4} />
          ) : !questions || questions.length === 0 ? (
            <EmptyTable noQuestions={!!noQuestions} />
          ) : (
            questions.map((question) => (
              <TableRow
                key={question.id}
                className='group cursor-pointer hover:bg-gray-50'
                onClick={() =>
                  navigate({
                    to: '/questions/$questionId/edit',
                    params: { questionId: question.id },
                  })
                }
              >
                <TableCell>{question.title}</TableCell>
                <TableCell>{question.timesTaken}</TableCell>
                <TableCell>
                  {question.avgScore !== null ? `${Math.round(question.avgScore * 100)}%` : '—'}
                </TableCell>
                <TableCell className='flex justify-between items-center gap-2 mr-4'>
                  <Tooltip content={formatDatetime(question.createdAt)}>
                    {formatRelativeDatetime(question.createdAt)}
                  </Tooltip>
                  <RowActions question={question} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableRoot>
  );
}

const EmptyTable = ({ noQuestions }: { noQuestions: boolean }) => {
  if (noQuestions) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <div className='flex flex-col items-center justify-center py-16 px-4'>
            <EmptyStateIcon icon={RiAddLine} />
            <SmallHeader className='mt-4'>No questions yet</SmallHeader>
            <MutedText>Create reusable questions for your assessments.</MutedText>
            <Link to='/questions/new'>
              <Button variant='primary' icon={RiAddLine} className='mt-4'>
                New Question
              </Button>
            </Link>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={4}>
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <EmptyStateIcon icon={RiFileTextLine} />
          <SmallHeader className='mt-4'>No questions match your filters</SmallHeader>
          <MutedText>Try adjusting your search criteria or filters.</MutedText>
        </div>
      </TableCell>
    </TableRow>
  );
};
