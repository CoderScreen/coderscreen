import { Badge } from '@coderscreen/ui/badge';
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
import {
  RiAddLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiMore2Line,
} from '@remixicon/react';
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

const DifficultyBadge = ({ difficulty }: { difficulty: string | null }) => {
  switch (difficulty) {
    case 'easy':
      return <Badge variant='success'>Easy</Badge>;
    case 'medium':
      return <Badge variant='warning'>Medium</Badge>;
    case 'hard':
      return <Badge variant='error'>Hard</Badge>;
    default:
      return null;
  }
};

const RowActions = ({ question }: { question: QuestionLibraryItem }) => {
  const { deleteQuestion } = useDeleteQuestionLibrary();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    await deleteQuestion(question.id);
    setDeleteOpen(false);
  };

  return (
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
            <TableHeaderCell>Difficulty</TableHeaderCell>
            <TableHeaderCell>Tags</TableHeaderCell>
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
                <TableCell>
                  <DifficultyBadge difficulty={question.difficulty} />
                </TableCell>
                <TableCell>
                  <div className='flex gap-1 flex-wrap'>
                    {(question.tags as string[])?.map((tag) => (
                      <Badge key={tag} variant='neutral'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
