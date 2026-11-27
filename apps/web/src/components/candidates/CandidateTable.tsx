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
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type ReviewableSubmission,
  ReviewStateBadge,
} from '@/components/assessments/detail/submissionReview';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useCandidates } from '@/query/assessment.query';
import { CreateCandidateDialog } from './CreateCandidateDialog';

export function CandidateTable() {
  const { candidates, isLoading } = useCandidates();
  const navigate = useNavigate();
  const noCandidates = candidates?.length === 0;

  return (
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Candidate</TableHeaderCell>
            <TableHeaderCell>Assessments</TableHeaderCell>
            <TableHeaderCell>Latest</TableHeaderCell>
            <TableHeaderCell>Added</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton numRows={10} numCols={4} />
          ) : !candidates || candidates.length === 0 ? (
            <EmptyTable noCandidates={!!noCandidates} />
          ) : (
            candidates.map((candidate) => {
              const latest = candidate.latestSubmission as
                | (ReviewableSubmission & { assessmentTitle: string })
                | null;
              return (
                <TableRow
                  key={candidate.id}
                  className='group cursor-pointer hover:bg-gray-50'
                  onClick={() =>
                    navigate({
                      to: '/candidates/$candidateId',
                      params: { candidateId: candidate.id },
                    })
                  }
                >
                  <TableCell>
                    <div className='font-medium text-gray-900'>{candidate.name}</div>
                    <MutedText className='text-xs'>{candidate.email}</MutedText>
                  </TableCell>
                  <TableCell>{candidate.assessmentCount}</TableCell>
                  <TableCell>
                    {latest ? (
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-900'>{latest.assessmentTitle}</span>
                        <ReviewStateBadge sub={latest} />
                      </div>
                    ) : (
                      <MutedText>Not invited yet</MutedText>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip content={formatDatetime(candidate.createdAt)}>
                      {formatRelativeDatetime(candidate.createdAt)}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
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
          <TableCell colSpan={4}>
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
      <TableCell colSpan={4}>
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <EmptyStateIcon icon={RiUserStarLine} />
          <SmallHeader className='mt-4'>No candidates match your filters</SmallHeader>
          <MutedText>Try adjusting your search criteria.</MutedText>
        </div>
      </TableCell>
    </TableRow>
  );
};
