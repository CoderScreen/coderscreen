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
import { RiAddLine, RiMailSendLine } from '@remixicon/react';
import { useState } from 'react';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useSubmissions } from '@/query/assessment.query';
import { InviteCandidateDialog } from './InviteCandidateDialog';

const SubmissionStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant='neutral'>Not Started</Badge>;
    case 'in_progress':
      return <Badge variant='warning'>In Progress</Badge>;
    case 'submitted':
      return <Badge variant='success'>Submitted</Badge>;
    case 'expired':
      return <Badge variant='error'>Expired</Badge>;
    case 'graded':
      return <Badge variant='success'>Graded</Badge>;
    default:
      return <Badge variant='neutral'>{status}</Badge>;
  }
};

interface AssessmentSubmissionsTabProps {
  assessmentId: string;
}

export const AssessmentSubmissionsTab = ({ assessmentId }: AssessmentSubmissionsTabProps) => {
  const { submissions, isLoading } = useSubmissions(assessmentId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className='py-6'>
      <div className='flex items-center justify-between mb-4'>
        <MutedText>
          {submissions?.length ?? 0} submission{(submissions?.length ?? 0) !== 1 ? 's' : ''}
        </MutedText>
        <Button icon={RiMailSendLine} onClick={() => setInviteDialogOpen(true)}>
          Invite Candidate
        </Button>
      </div>

      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Candidate</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Score</TableHeaderCell>
              <TableHeaderCell>Started</TableHeaderCell>
              <TableHeaderCell>Submitted</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton numRows={5} numCols={6} />
            ) : !submissions || submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className='flex flex-col items-center justify-center py-12 px-4'>
                    <EmptyStateIcon icon={RiMailSendLine} />
                    <SmallHeader className='mt-4'>No submissions yet</SmallHeader>
                    <MutedText>Invite candidates to take this assessment.</MutedText>
                    <Button
                      variant='primary'
                      icon={RiAddLine}
                      className='mt-4'
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      Invite Candidate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub: Record<string, unknown>) => (
                <TableRow key={sub.id as string}>
                  <TableCell>{(sub.candidateName as string) || '-'}</TableCell>
                  <TableCell>{(sub.candidateEmail as string) || '-'}</TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={sub.status as string} />
                  </TableCell>
                  <TableCell>
                    {sub.totalScore != null && sub.maxScore != null
                      ? `${sub.totalScore}/${sub.maxScore}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {sub.startedAt ? (
                      <Tooltip content={formatDatetime(sub.startedAt as string)}>
                        {formatRelativeDatetime(sub.startedAt as string)}
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.submittedAt ? (
                      <Tooltip content={formatDatetime(sub.submittedAt as string)}>
                        {formatRelativeDatetime(sub.submittedAt as string)}
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>

      <InviteCandidateDialog
        assessmentId={assessmentId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
};
