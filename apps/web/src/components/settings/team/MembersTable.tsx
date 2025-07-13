import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuIconWrapper,
} from '@/components/ui/dropdown';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRoot,
  TableSkeleton,
} from '@/components/ui/table';
import {
  RiMoreLine,
  RiUserLine,
  RiVipCrownLine,
  RiShieldUserLine,
  RiDeleteBinLine,
  RiCloseLine,
} from '@remixicon/react';
import { useSession } from '@/query/auth.query';
import { formatDatetime } from '@/lib/dateUtils';
import { useActiveOrg } from '@/query/org.query';
import { UserAvatar } from '@/components/common/UserAvatar';

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

const MemberActions = ({ member, onRemove }: { member: any; onRemove: (id: string) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='icon' icon={RiMoreLine} />
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
  const { user } = useSession();
  const { org, isLoading: isLoadingOrg } = useActiveOrg();

  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement actual API call
    console.log('Remove member:', memberId);
    setRemoveMemberId(null);
  };

  const canManageMember = (memberRole: string, memberId: string) => {
    if (!user) return false;
    // Owner can manage everyone except themselves
    if (user.id === memberId) return false;
    // Admin can manage members but not owners or other admins
    return memberRole === 'member';
  };

  return (
    <div>
      {/* Current Members */}
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Current Members</h3>
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

                      {canManageMember(member.role, member.id) && (
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
            <Button variant='secondary' onClick={() => setRemoveMemberId(null)}>
              <RiCloseLine className='h-4 w-4 mr-2' />
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => removeMemberId && handleRemoveMember(removeMemberId)}
            >
              <RiDeleteBinLine className='h-4 w-4 mr-2' />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
