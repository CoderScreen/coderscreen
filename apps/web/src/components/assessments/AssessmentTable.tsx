import type { AssessmentSchema } from '@coderscreen/api/schema/assessment';
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
  RiListCheck3,
  RiMore2Line,
} from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { Pagination } from '@/components/common/Pagination';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useAssessments, useDeleteAssessment } from '@/query/assessment.query';
import { CreateAssessmentDialog } from './CreateAssessmentDialog';

const StatusBadge = ({ status }: { status: AssessmentSchema['status'] }) => {
  switch (status) {
    case 'active':
      return <Badge variant='success'>Active</Badge>;
    case 'draft':
      return <Badge variant='warning'>Draft</Badge>;
    case 'archived':
      return <Badge variant='neutral'>Archived</Badge>;
    default:
      return <Badge variant='neutral'>Unknown</Badge>;
  }
};

const RowActions = ({ assessment }: { assessment: AssessmentSchema }) => {
  const { deleteAssessment, isLoading } = useDeleteAssessment();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    await deleteAssessment(assessment.id);
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
        title='Delete Assessment'
        description='Are you sure you want to delete this assessment? This action cannot be undone.'
        isLoading={isLoading}
      />
    </div>
  );
};

export function AssessmentTable() {
  const [page, setPage] = useState(1);
  const { assessments, pagination, isLoading } = useAssessments(page);
  const navigate = useNavigate();
  const noAssessments = assessments?.length === 0 && page === 1;

  return (
    <>
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton numRows={10} numCols={3} />
          ) : !assessments || assessments.length === 0 ? (
            <EmptyTable noAssessments={!!noAssessments} />
          ) : (
            assessments.map((assessment) => (
              <TableRow
                key={assessment.id}
                className='group cursor-pointer hover:bg-gray-50'
                onClick={() =>
                  navigate({
                    to: '/assessments/$assessmentId',
                    params: { assessmentId: assessment.id },
                  })
                }
              >
                <TableCell>{assessment.title}</TableCell>
                <TableCell>
                  <StatusBadge status={assessment.status} />
                </TableCell>
                <TableCell className='flex justify-between items-center gap-2 mr-4'>
                  <Tooltip content={formatDatetime(assessment.createdAt)}>
                    {formatRelativeDatetime(assessment.createdAt)}
                  </Tooltip>
                  <RowActions assessment={assessment} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableRoot>
    {pagination && (
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    )}
    </>
  );
}

const EmptyTable = ({ noAssessments }: { noAssessments: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (noAssessments) {
    return (
      <>
        <TableRow>
          <TableCell colSpan={3}>
            <div className='flex flex-col items-center justify-center py-16 px-4'>
              <EmptyStateIcon icon={RiAddLine} />
              <SmallHeader className='mt-4'>No assessments yet</SmallHeader>
              <MutedText>Create a new assessment to start evaluating candidates.</MutedText>
              <Button
                variant='primary'
                icon={RiAddLine}
                className='mt-4'
                onClick={() => setDialogOpen(true)}
              >
                New Assessment
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <CreateAssessmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={3}>
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <EmptyStateIcon icon={RiListCheck3} />
          <SmallHeader className='mt-4'>No assessments match your filters</SmallHeader>
          <MutedText>Try adjusting your search criteria or filters.</MutedText>
        </div>
      </TableCell>
    </TableRow>
  );
};
