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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
  TableSkeleton,
} from '@coderscreen/ui/table';
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiMore2Line,
  RiShieldUserLine,
  RiUserLine,
  RiVipCrownLine,
} from '@remixicon/react';
import { Member } from 'better-auth/plugins/organization';
import { useMemo, useState } from 'react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatDatetime } from '@/lib/dateUtils';
import { useCurrentMember } from '@/query/auth.query';
import { useActiveOrg } from '@/query/org.query';
import { useRemoveMember } from '@/query/team.query';

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'owner':
      return (
        <Badge className='bg-yellow-100 text-yellow-800'>
          <RiVipCrownLine className='h-3 w-3 text-yellow-500' />
          Owner
        </Badge>
      );
    case 'admin':
      return (
        <Badge className='bg-blue-100 text-blue-800'>
          <RiShieldUserLine className='h-3 w-3 text-blue-500' />
          Admin
        </Badge>
      );
    default:
      return (
        <Badge className='bg-gray-100 text-gray-800'>
          <RiUserLine className='h-3 w-3 text-gray-500' />
          Member
        </Badge>
      );
  }
};

const MemberActions = ({
  member,
  onRemove,
}: {
  member: Member;
  onRemove: (id: string) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='icon' icon={RiMore2Line} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => onRemove(member.id)}
          className='text-red-600 focus:text-red-600 focus:bg-red-50'
        >
          <DropdownMenuIconWrapper className='text-red-600'>
            <RiDeleteBinLine className='size-4' />
          </DropdownMenuIconWrapper>
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export const MembersTable = () => {
  const { member } = useCurrentMember();
  const { org, isLoading: isLoadingOrg } = useActiveOrg();

  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const { removeMember, isLoading: isRemovingMember } = useRemoveMember();

  const handleRemoveMember = async (memberId: string) => {
    await removeMember(memberId);
    setRemoveMemberId(null);
  };

  const canManageMember = useMemo(() => {
    return member?.role === 'owner' || member?.role === 'admin';
  }, [member]);

  return (
    <div>
      {/* Current Members */}
      <div>
        <div>
          <SmallHeader>Current Members</SmallHeader>
        </div>
        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Member</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell className='text-right'>Joined</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingOrg ? (
                <TableSkeleton numRows={10} numCols={4} />
              ) : (
                (org?.members ?? []).map((member) => (
                  <TableRow key={member.id} className='group'>
                    <TableCell>
                      <div className='flex items-center'>
                        <UserAvatar user={member.user} />
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {member.user.name}
                          </div>
                          <div className='text-sm text-gray-500'>{member.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className='text-right'>
                      <span className='text-sm text-gray-500'>
                        {formatDatetime(member.createdAt)}
                      </span>

                      {member.role !== 'owner' && canManageMember && (
                        <MemberActions member={member} onRemove={setRemoveMemberId} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableRoot>
      </div>

      {/* Remove Member Dialog */}
      <Dialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to remove this team member? They will lose access to the
            organization.
          </DialogDescription>
          <DialogFooter>
            <Button variant='secondary' onClick={() => setRemoveMemberId(null)} icon={RiCloseLine}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => removeMemberId && handleRemoveMember(removeMemberId)}
              icon={RiDeleteBinLine}
              isLoading={isRemovingMember}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
