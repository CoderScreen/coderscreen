import type { AssessmentSchema } from '@coderscreen/api/schema/assessment';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { SmallHeader } from '@coderscreen/ui/heading';
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiLockLine,
  RiLockUnlockLine,
  RiMailSendLine,
  RiMore2Line,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useArchiveAssessment, usePublishAssessment } from '@/query/assessment.query';
import { parseApiError } from '@/query/error.query';
import { InviteCandidateDialog } from './InviteCandidateDialog';
import { getPublishBlockers } from './publishBlockers';

const StatusBadge = ({ status }: { status: AssessmentSchema['status'] }) => {
  switch (status) {
    case 'active':
      return <Badge variant='success'>Active</Badge>;
    case 'draft':
      return <Badge variant='warning'>Draft</Badge>;
    case 'archived':
      return <Badge variant='neutral'>Closed</Badge>;
    default:
      return <Badge variant='neutral'>Unknown</Badge>;
  }
};

interface AssessmentDetailHeaderProps {
  assessment: AssessmentSchema & {
    questions?: { title: string; testCases?: unknown[] }[];
  };
}

export const AssessmentDetailHeader = ({ assessment }: AssessmentDetailHeaderProps) => {
  const { publishAssessment, isLoading: isPublishing, error } = usePublishAssessment();
  const { archiveAssessment, isLoading: isClosing } = useArchiveAssessment();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const isDraft = assessment.status === 'draft';
  const isActive = assessment.status === 'active';
  const isClosed = assessment.status === 'archived';
  const blockers = isDraft ? getPublishBlockers(assessment.questions) : [];

  return (
    <div className='py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link to='/assessments'>
            <Button variant='ghost' icon={RiArrowLeftLine} className='p-1' />
          </Link>
          <SmallHeader>{assessment.title}</SmallHeader>
        </div>

        <div className='flex items-center gap-2'>
          <StatusBadge status={assessment.status} />
          {isDraft && (
            <Button
              variant='primary'
              icon={RiCheckLine}
              onClick={() => {
                // The reason is rendered below from `error`.
                publishAssessment(assessment.id).catch(() => {});
              }}
              isLoading={isPublishing}
              disabled={blockers.length > 0}
            >
              Publish
            </Button>
          )}
          {isActive && (
            <Button icon={RiMailSendLine} onClick={() => setInviteOpen(true)}>
              Invite candidates
            </Button>
          )}
          {isClosed && (
            <Button
              variant='secondary'
              icon={RiLockUnlockLine}
              onClick={() => publishAssessment(assessment.id).catch(() => {})}
              isLoading={isPublishing}
            >
              Reopen
            </Button>
          )}
          {isActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='icon' icon={RiMore2Line} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setCloseOpen(true)}>
                  <DropdownMenuIconWrapper>
                    <RiLockLine className='size-4' />
                  </DropdownMenuIconWrapper>
                  Close assessment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isClosed && (
        <div className='mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700'>
          This assessment is closed. It can't be sent to new candidates, and invites that haven't
          been started no longer work. Reopen it to start inviting again.
          {error && (
            <p className='mt-1 text-red-700'>Couldn't reopen: {parseApiError(error).message}</p>
          )}
        </div>
      )}

      <InviteCandidateDialog
        assessmentId={assessment.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Close this assessment?</DialogTitle>
            <DialogDescription>
              New candidates can't be invited, and invites that haven't been started stop working.
              Candidates who already started can still finish. You can reopen it anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='secondary' onClick={() => setCloseOpen(false)}>
              Cancel
            </Button>
            <Button
              icon={RiLockLine}
              isLoading={isClosing}
              onClick={async () => {
                await archiveAssessment(assessment.id).catch(() => {});
                setCloseOpen(false);
              }}
            >
              Close assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDraft && blockers.length > 0 && (
        <div className='mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800'>
          <p>
            This assessment is a draft. Publish it to start inviting candidates. Before you can
            publish:
          </p>
          <ul className='list-disc pl-5 mt-1'>
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {isDraft && blockers.length === 0 && error && (
        <div className='mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
          Couldn't publish: {parseApiError(error).message}
        </div>
      )}
    </div>
  );
};
