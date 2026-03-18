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
  RiCornerDownRightLine,
  RiDeleteBinLine,
  RiListCheck3,
  RiMore2Line,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
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
  const { deleteAssessment } = useDeleteAssessment();

  const handleDelete = async () => {
    await deleteAssessment(assessment.id);
  };

  return (
    <div className='flex items-center gap-2'>
      <Link to='/assessments/$assessmentId' params={{ assessmentId: assessment.id }}>
        <Button variant='secondary' icon={RiCornerDownRightLine} iconPosition='right'>
          View
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='icon' icon={RiMore2Line} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={handleDelete}
            className='text-red-600 focus:text-red-600 focus:bg-red-50'
          >
            <DropdownMenuIconWrapper className='text-red-600'>
              <RiDeleteBinLine className='size-4' />
            </DropdownMenuIconWrapper>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function AssessmentTable() {
  const { assessments, isLoading } = useAssessments();
  const noAssessments = assessments?.length === 0;

  return (
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
              <TableRow key={assessment.id} className='group'>
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
