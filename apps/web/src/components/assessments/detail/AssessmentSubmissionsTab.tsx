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
  RiArchiveLine,
  RiFileCopyLine,
  RiInboxUnarchiveLine,
  RiMailSendLine,
  RiMore2Line,
} from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { useArchiveSubmission, useSubmissions } from '@/query/assessment.query';
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
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const allSubmissions = (submissions ?? []) as Record<string, unknown>[];
  const archivedCount = allSubmissions.filter((s) => s.isArchived === true).length;
  const visibleSubmissions = showArchived
    ? allSubmissions
    : allSubmissions.filter((s) => s.isArchived !== true);

  return (
    <div className='py-6'>
      <div className='flex items-center justify-between mb-4'>
        <MutedText>
          {visibleSubmissions.length} submission{visibleSubmissions.length !== 1 ? 's' : ''}
        </MutedText>
        <div className='flex items-center gap-2'>
          {archivedCount > 0 && (
            <Button variant='secondary' onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
            </Button>
          )}
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
            ) : visibleSubmissions.length === 0 ? (
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
              visibleSubmissions.map((sub: Record<string, unknown>) => {
                const candidate = sub.candidate as Record<string, unknown>;
                const isArchived = sub.isArchived === true;
                return (
                  <TableRow
                    key={sub.id as string}
                    className={`cursor-pointer hover:bg-gray-50 ${isArchived ? 'opacity-60' : ''}`}
                    onClick={() =>
                      navigate({
                        to: '/assessments/$assessmentId/submissions/$subId',
                        params: { assessmentId, subId: sub.id as string },
                      })
                    }
                  >
                    <TableCell>
                      <span className='inline-flex items-center gap-2'>
                        {candidate.name as string}
                        {isArchived && <Badge variant='neutral'>Archived</Badge>}
                      </span>
                    </TableCell>
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
                        assessmentId={assessmentId}
                        subId={sub.id as string}
                        accessToken={sub.accessToken as string}
                        isArchived={isArchived}
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
    </div>
  );
};

interface SubmissionRowActionsProps {
  assessmentId: string;
  subId: string;
  accessToken: string;
  isArchived: boolean;
}

const SubmissionRowActions = ({
  assessmentId,
  subId,
  accessToken,
  isArchived,
}: SubmissionRowActionsProps) => {
  const { archiveSubmission, isLoading } = useArchiveSubmission(assessmentId);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/take/${subId}?token=${accessToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops the parent row's click from firing; it is not itself an interactive control
    // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper has no keyboard semantics of its own
    <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='icon' icon={RiMore2Line} isLoading={isLoading} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handleCopyLink}>
            <DropdownMenuIconWrapper>
              <RiFileCopyLine className='size-4' />
            </DropdownMenuIconWrapper>
            Copy Invite Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => archiveSubmission({ subId, archived: !isArchived })}>
            <DropdownMenuIconWrapper>
              {isArchived ? (
                <RiInboxUnarchiveLine className='size-4' />
              ) : (
                <RiArchiveLine className='size-4' />
              )}
            </DropdownMenuIconWrapper>
            {isArchived ? 'Unarchive' : 'Archive'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
