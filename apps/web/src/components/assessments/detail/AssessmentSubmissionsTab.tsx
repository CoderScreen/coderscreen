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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
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
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiAddLine,
  RiArchiveLine,
  RiFileCopyLine,
  RiInboxUnarchiveLine,
  RiMailSendLine,
  RiMore2Line,
  RiTimeLine,
} from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { formatDatetime } from '@/lib/dateUtils';
import {
  useArchiveSubmission,
  useExtendSubmission,
  useResendInvite,
  useSubmissions,
} from '@/query/assessment.query';
import { InviteCandidateDialog } from './InviteCandidateDialog';
import {
  getFinishedAt,
  getReviewState,
  getTimeLeft,
  getTimeTaken,
  matchesFilter,
  type ReviewableSubmission,
  ReviewStateBadge,
  type SubmissionFilter,
  type SubmissionSort,
  sortSubmissions,
} from './submissionReview';

interface AssessmentSubmissionsTabProps {
  assessmentId: string;
  assessmentStatus?: 'draft' | 'active' | 'archived';
  filter: SubmissionFilter;
  sort: SubmissionSort;
  onListChange: (next: { filter?: SubmissionFilter; sort?: SubmissionSort }) => void;
}

type SubmissionRow = ReviewableSubmission & {
  accessToken: string;
  candidate: { name: string; email: string } | null;
};

type Filter = SubmissionFilter;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs_review', label: 'Needs review' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'invited', label: 'Invited' },
  { value: 'reviewed', label: 'Reviewed' },
];

// The API only accepts invites for active assessments.
const inviteBlockedReason = (status: AssessmentSubmissionsTabProps['assessmentStatus']) => {
  if (status === 'draft') return 'Publish this assessment before inviting candidates.';
  if (status === 'archived')
    return 'This assessment is archived, so it no longer accepts new candidates.';
  return null;
};

export const AssessmentSubmissionsTab = ({
  assessmentId,
  assessmentStatus,
  filter,
  sort,
  onListChange,
}: AssessmentSubmissionsTabProps) => {
  const { submissions, isLoading } = useSubmissions(assessmentId);
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const blockedReason = inviteBlockedReason(assessmentStatus);

  const allSubmissions = (submissions ?? []) as unknown as SubmissionRow[];
  const archivedCount = allSubmissions.filter((s) => s.isArchived === true).length;
  const inScope = showArchived ? allSubmissions : allSubmissions.filter((s) => !s.isArchived);

  const counts = useMemo(() => {
    const result = {} as Record<Filter, number>;
    for (const f of FILTERS)
      result[f.value] = inScope.filter((s) => matchesFilter(s, f.value)).length;
    return result;
  }, [inScope]);

  const visibleSubmissions = sortSubmissions(
    inScope.filter((s) => matchesFilter(s, filter)),
    sort
  );

  const openSubmission = (subId: string) =>
    navigate({
      to: '/assessments/$assessmentId/submissions/$subId',
      params: { assessmentId, subId },
      search: { filter, sort },
    });

  const hasAny = allSubmissions.length > 0;

  return (
    <div className='py-6'>
      <div className='flex items-center justify-between gap-4 mb-4'>
        <Tabs value={filter} onValueChange={(v) => onListChange({ filter: v as Filter })}>
          <TabsList variant='solid'>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
                <span className='ml-1.5 text-gray-500'>{counts[f.value] ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className='flex items-center gap-2'>
          <Select value={sort} onValueChange={(v) => onListChange({ sort: v as SubmissionSort })}>
            <SelectTrigger className='w-44'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='recent'>Most recent</SelectItem>
              <SelectItem value='score'>Highest score</SelectItem>
            </SelectContent>
          </Select>
          {archivedCount > 0 && (
            <Button variant='secondary' onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
            </Button>
          )}
        </div>
      </div>

      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Candidate</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Score</TableHeaderCell>
              <TableHeaderCell>Time taken</TableHeaderCell>
              <TableHeaderCell>Started</TableHeaderCell>
              <TableHeaderCell>Finished</TableHeaderCell>
              <TableHeaderCell className='w-20' />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton numRows={5} numCols={7} />
            ) : !hasAny ? (
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
                      disabled={!!blockedReason}
                    >
                      Invite Candidate
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : visibleSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className='py-10 text-center'>
                    <MutedText>No candidates match this filter.</MutedText>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleSubmissions.map((sub) => {
                const isArchived = sub.isArchived === true;
                const finishedAt = getFinishedAt(sub);
                const timeLeft = getTimeLeft(sub);
                return (
                  <TableRow
                    key={sub.id}
                    className={`cursor-pointer hover:bg-gray-50 ${isArchived ? 'opacity-60' : ''}`}
                    onClick={() => openSubmission(sub.id)}
                  >
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-gray-900'>{sub.candidate?.name}</span>
                        {isArchived && <Badge variant='neutral'>Archived</Badge>}
                      </div>
                      <MutedText className='text-xs'>{sub.candidate?.email}</MutedText>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col items-start gap-0.5'>
                        <ReviewStateBadge sub={sub} />
                        {sub.status === 'expired' && (
                          <MutedText className='text-xs'>Time ran out</MutedText>
                        )}
                        {timeLeft && <MutedText className='text-xs'>{timeLeft}</MutedText>}
                        {sub.status === 'not_started' && sub.startBy && (
                          <MutedText className='text-xs'>
                            {getReviewState(sub) === 'invite_expired' ? 'Expired' : 'Start by'}{' '}
                            {formatDatetime(sub.startBy)}
                          </MutedText>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.totalScore != null && sub.maxScore != null
                        ? `${sub.totalScore}/${sub.maxScore}`
                        : '-'}
                    </TableCell>
                    <TableCell>{getTimeTaken(sub) ?? '-'}</TableCell>
                    <TableCell>{sub.startedAt ? formatDatetime(sub.startedAt) : '-'}</TableCell>
                    <TableCell>{finishedAt ? formatDatetime(finishedAt) : '-'}</TableCell>
                    <TableCell>
                      <SubmissionRowActions
                        assessmentId={assessmentId}
                        sub={sub}
                        assessmentClosed={assessmentStatus !== 'active'}
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

const SubmissionRowActions = ({
  assessmentId,
  sub,
  assessmentClosed,
}: {
  assessmentId: string;
  sub: SubmissionRow;
  assessmentClosed: boolean;
}) => {
  const { archiveSubmission, isLoading } = useArchiveSubmission(assessmentId);
  const { resendInvite, isLoading: isResending } = useResendInvite(assessmentId);
  const { extendSubmission, isLoading: isExtending } = useExtendSubmission(assessmentId);

  const isArchived = sub.isArchived === true;
  const state = getReviewState(sub);
  // A closed assessment can't be started, so invite actions would only send dead links.
  const notStarted = sub.status === 'not_started' && !isArchived && !assessmentClosed;
  const canAddTime = sub.status === 'in_progress' && !!sub.expiresAt && !isArchived;

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/take/${sub.id}?token=${sub.accessToken}`
    );
    toast.success('Invite link copied');
  };
  const resend = async () => {
    const { emailSent } = await resendInvite(sub.id);
    if (emailSent) toast.success(`Invite sent again to ${sub.candidate?.email}`);
    else toast.error("Couldn't send the email. Copy the link and share it directly.");
  };
  const extend = (minutes: number) => extendSubmission({ subId: sub.id, minutes }).catch(() => {});

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops the parent row's click from firing; it is not itself an interactive control
    // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper has no keyboard semantics of its own
    <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='icon'
            icon={RiMore2Line}
            isLoading={isLoading || isResending || isExtending}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {(notStarted || canAddTime) && (
            <DropdownMenuItem onClick={copyLink}>
              <DropdownMenuIconWrapper>
                <RiFileCopyLine className='size-4' />
              </DropdownMenuIconWrapper>
              Copy invite link
            </DropdownMenuItem>
          )}
          {notStarted && state !== 'invite_expired' && (
            <DropdownMenuItem onClick={() => resend().catch(() => {})}>
              <DropdownMenuIconWrapper>
                <RiMailSendLine className='size-4' />
              </DropdownMenuIconWrapper>
              Resend invite
            </DropdownMenuItem>
          )}
          {notStarted && sub.startBy && (
            <DropdownMenuItem onClick={() => extend(3 * 24 * 60)}>
              <DropdownMenuIconWrapper>
                <RiTimeLine className='size-4' />
              </DropdownMenuIconWrapper>
              {state === 'invite_expired' ? 'Reopen for 3 more days' : 'Extend deadline 3 days'}
            </DropdownMenuItem>
          )}
          {canAddTime &&
            [15, 30, 60].map((minutes) => (
              <DropdownMenuItem key={minutes} onClick={() => extend(minutes)}>
                <DropdownMenuIconWrapper>
                  <RiTimeLine className='size-4' />
                </DropdownMenuIconWrapper>
                Add {minutes} minutes
              </DropdownMenuItem>
            ))}
          <DropdownMenuItem
            onClick={() =>
              archiveSubmission({ subId: sub.id, archived: !isArchived }).catch(() => {})
            }
          >
            <DropdownMenuIconWrapper>
              {isArchived ? (
                <RiInboxUnarchiveLine className='size-4' />
              ) : (
                <RiArchiveLine className='size-4' />
              )}
            </DropdownMenuIconWrapper>
            {isArchived ? 'Unarchive' : notStarted ? 'Cancel invite' : 'Archive'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
