import {
  RiCheckLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiLockLine,
  RiMore2Line,
  RiResetRightLine,
  RiTimeLine,
  RiUserAddLine,
} from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { Invitation } from 'better-auth/plugins/organization';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { SmallHeader } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
  TableSkeleton,
} from '@/components/ui/table';
import { MutedText } from '@/components/ui/typography';
import { formatDatetime } from '@/lib/dateUtils';
import { formatSlug } from '@/lib/slug';
import { useCurrentMember } from '@/query/auth.query';
import { useUsage } from '@/query/billing.query';
import { useCancelInvitation, useInvitations, useInviteMember } from '@/query/team.query';
import { getRoleBadge } from './MembersTable';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className='bg-amber-100 text-amber-800'>
          <RiTimeLine className='h-3 w-3' />
          Pending
        </Badge>
      );
    case 'accepted':
      return (
        <Badge className='bg-green-100 text-green-800'>
          <RiCheckLine className='h-3 w-3' />
          Accepted
        </Badge>
      );
    case 'expired':
      return (
        <Badge className='bg-red-100 text-red-800'>
          <RiTimeLine className='h-3 w-3' />
          Expired
        </Badge>
      );
    case 'canceled':
      return (
        <Badge className='bg-gray-100 text-gray-800'>
          <RiCloseLine className='h-3 w-3' />
          Canceled
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className='bg-red-100 text-red-800'>
          <RiCloseLine className='h-3 w-3' />
          Rejected
        </Badge>
      );
    default:
      return <Badge className='bg-gray-100 text-gray-800'>{formatSlug(status)}</Badge>;
  }
};

const formSchema = z.object({
  email: z.string().email().min(2, 'Email is required'),
  role: z.enum(['member', 'admin', 'owner']),
});

const initialValues = {
  email: '',
  role: 'member',
} as z.infer<typeof formSchema>;

export const InviteMembers = () => {
  const { member } = useCurrentMember();
  const { usage } = useUsage('team_members');
  const [cancelInvitationId, setCancelInvitationId] = useState<string | null>(null);

  const canEdit = useMemo(() => {
    if (!member) return true;
    return member.role === 'owner' || member.role === 'admin';
  }, [member]);

  const { invitations, isLoading: isLoadingInvitations } = useInvitations();
  const sortedInvitations = useMemo(() => {
    return [...(invitations ?? [])]
      .filter((invitation) => invitation.status !== 'canceled')
      .sort((a, b) => {
        return b.expiresAt.getTime() - a.expiresAt.getTime();
      });
  }, [invitations]);

  const { inviteMember, isLoading: isInviting } = useInviteMember();
  const { cancelInvitation, isLoading: isCancelling } = useCancelInvitation();

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await inviteMember(value);
    },
  });

  const handleCancelInvitation = async (invitationId: string) => {
    await cancelInvitation(invitationId);
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    await inviteMember({
      email: invitation.email,
      role: invitation.role as 'member' | 'admin' | 'owner',
      resend: true,
    });
  };

  return (
    <div className='mt-6'>
      <div>
        <SmallHeader>Invite Team Members</SmallHeader>
        <MutedText>
          The invited user will receive an email with a link to join your organization. They'll need
          to create an account if they don't already have one.
        </MutedText>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className='space-y-4 mt-4'
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='md:col-span-2'>
            <form.Field name='email'>
              {(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>Email Address</Label>
                  <Input
                    id={field.name}
                    type='email'
                    placeholder='Enter email address'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    hasError={!field.state.meta.isValid}
                    disabled={usage?.exceeded || !canEdit}
                  />
                  {field.state.meta.errors && (
                    <p className='text-sm text-red-600'>
                      {field.state.meta.errors.map((e) => e?.message).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name='role'>
              {(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>Role</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as 'member' | 'admin')}
                    disabled={usage?.exceeded || !canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>Member</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <div className='flex justify-between'>
          {usage?.exceeded ? (
            <div className='px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <RiTimeLine className='h-4 w-4 text-amber-600' />
                <p className='text-sm text-amber-800'>
                  You've reached your team member limit. Please upgrade your plan to invite more
                  members.
                </p>
              </div>
            </div>
          ) : !canEdit ? (
            <div className='px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <RiLockLine className='h-4 w-4 text-amber-600' />
                <p className='text-sm text-amber-800'>Only admins and owners can invite members.</p>
              </div>
            </div>
          ) : (
            <div />
          )}

          <div>
            <Button
              type='submit'
              icon={RiUserAddLine}
              isLoading={isInviting}
              disabled={!form.state.isFormValid || usage?.exceeded || !canEdit}
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </form>

      {/* Pending Invitations */}
      <div className='mt-4'>
        <div>
          <SmallHeader>Pending Invitations</SmallHeader>

          {usage?.exceeded ? (
            <MutedText>You have no more invitations left</MutedText>
          ) : (
            <MutedText>
              You can invite up to {usage?.limit ?? 0 - (usage?.count ?? 0)} members
            </MutedText>
          )}
        </div>

        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className='text-right'>Expires</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingInvitations ? (
                <TableSkeleton numRows={10} numCols={4} />
              ) : (
                sortedInvitations.map((invitation) => (
                  <TableRow key={invitation.id} className='group'>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center gap-2 justify-end'>
                        <span className='text-sm text-gray-500'>
                          {formatDatetime(invitation.expiresAt)}
                        </span>

                        {canEdit && (
                          <InvitationActions
                            onCancel={() => setCancelInvitationId(invitation.id)}
                            onResend={() => handleResendInvitation(invitation)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableRoot>
      </div>

      {/* Cancel Invitation Dialog */}
      <Dialog open={!!cancelInvitationId} onOpenChange={() => setCancelInvitationId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invitation</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to cancel this invitation? The user will no longer be able to join
            the organization.
          </DialogDescription>
          <DialogFooter className='mt-4'>
            <Button
              variant='secondary'
              onClick={() => {
                setCancelInvitationId(null);
              }}
              icon={RiCloseLine}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={async () => {
                if (cancelInvitationId) {
                  await handleCancelInvitation(cancelInvitationId);
                  setCancelInvitationId(null);
                }
              }}
              icon={RiCloseCircleLine}
              isLoading={isCancelling}
            >
              Cancel Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InvitationActions = ({
  onResend,
  onCancel,
}: {
  onResend: () => void;
  onCancel: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='icon' icon={RiMore2Line} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onResend}>
          <RiResetRightLine className='h-4 w-4 mr-2' />
          Resend
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCancel}
          className='text-red-600 focus:text-red-600 focus:bg-red-50'
        >
          <RiDeleteBinLine className='h-4 w-4 mr-2' />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
