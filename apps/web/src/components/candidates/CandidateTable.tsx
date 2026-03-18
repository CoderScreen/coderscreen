import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
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
import { RiAddLine, RiUserStarLine } from '@remixicon/react';
import { useState } from 'react';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useCandidates } from '@/query/assessment.query';
import { CreateCandidateDialog } from './CreateCandidateDialog';

export function CandidateTable() {
  const { candidates, isLoading } = useCandidates();
  const noCandidates = candidates?.length === 0;

  return (
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton numRows={10} numCols={3} />
          ) : !candidates || candidates.length === 0 ? (
            <EmptyTable noCandidates={!!noCandidates} />
          ) : (
            candidates.map((candidate) => (
              <TableRow key={candidate.id} className='group'>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>
                  <Tooltip content={formatDatetime(candidate.createdAt)}>
                    {formatRelativeDatetime(candidate.createdAt)}
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableRoot>
  );
}

const EmptyTable = ({ noCandidates }: { noCandidates: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (noCandidates) {
    return (
      <>
        <TableRow>
          <TableCell colSpan={3}>
            <div className='flex flex-col items-center justify-center py-16 px-4'>
              <EmptyStateIcon icon={RiAddLine} />
              <SmallHeader className='mt-4'>No candidates yet</SmallHeader>
              <MutedText>Add candidates or invite them through assessments.</MutedText>
              <Button
                variant='primary'
                icon={RiAddLine}
                className='mt-4'
                onClick={() => setDialogOpen(true)}
              >
                Add Candidate
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <CreateCandidateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={3}>
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <EmptyStateIcon icon={RiUserStarLine} />
          <SmallHeader className='mt-4'>No candidates match your filters</SmallHeader>
          <MutedText>Try adjusting your search criteria.</MutedText>
        </div>
      </TableCell>
    </TableRow>
  );
};
