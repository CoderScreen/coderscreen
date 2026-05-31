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
  RiEyeLine,
  RiFileCopyLine,
  RiMailSendLine,
  RiMore2Line,
} from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useSubmissions } from '@/query/assessment.query';
import { InviteCandidateDialog } from './InviteCandidateDialog';
import { SubmissionDetailDialog } from './SubmissionDetailView';

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
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  return (
    <div className='py-6'>
      <div className='flex items-center justify-between mb-4'>
        <MutedText>
          {submissions?.length ?? 0} submission{(submissions?.length ?? 0) !== 1 ? 's' : ''}
        </MutedText>
        <div className='flex items-center gap-2'>
          <Button
            variant='secondary'
            icon={RiEyeLine}
            onClick={() => window.open(`/assessments/${assessmentId}/preview`, '_blank')}
          >
            Preview
          </Button>
          <Button icon={RiMailSendLine} onClick={() => setInviteDialogOpen(true)}>
            Invite Candidate
          </Button>
        </div>
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
              <TableHeaderCell className='w-20' />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton numRows={5} numCols={7} />
            ) : !submissions || submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
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
              submissions.map((sub: Record<string, unknown>) => {
                const candidate = sub.candidate as Record<string, unknown>;
                return (
                  <TableRow
                    key={sub.id as string}
                    className='cursor-pointer hover:bg-gray-50'
                    onClick={() => setSelectedSubId(sub.id as string)}
                  >
                    <TableCell>{candidate.name as string}</TableCell>
                    <TableCell>{candidate.email as string}</TableCell>
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
                    <TableCell>
                      <SubmissionRowActions
                        subId={sub.id as string}
                        accessToken={sub.accessToken as string}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableRoot>

      <InviteCandidateDialog
        assessmentId={assessmentId}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {selectedSubId && (
        <SubmissionDetailDialog
          assessmentId={assessmentId}
          subId={selectedSubId}
          open={!!selectedSubId}
          onOpenChange={(open) => {
            if (!open) setSelectedSubId(null);
          }}
        />
      )}
    </div>
  );
};

interface SubmissionRowActionsProps {
  subId: string;
  accessToken: string;
}

const SubmissionRowActions = ({ subId, accessToken }: SubmissionRowActionsProps) => {
  const handleCopyLink = () => {
    const link = `${window.location.origin}/take/${subId}?token=${accessToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  return (
    <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='icon' icon={RiMore2Line} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handleCopyLink}>
            <DropdownMenuIconWrapper>
              <RiFileCopyLine className='size-4' />
            </DropdownMenuIconWrapper>
            Copy Invite Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
