import { useActiveOrg } from '@/query/org.query';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { Divider } from '@/components/ui/divider';
import { MembersTable } from './team/MembersTable';
import { InviteMembers } from './team/InviteMembers';

export const TeamView = () => {
  const { org, isLoading: isOrgLoading } = useActiveOrg();

  if (isOrgLoading) {
    return (
      <div className='min-h-screen flex flex-col gap-4 p-4 max-w-4xl'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-1/3'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3'></div>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col p-4 max-w-4xl'>
      <div>
        <SmallHeader>Team Management</SmallHeader>
        <MutedText>Manage your team members and invitations</MutedText>
      </div>

      <Divider />

      <MembersTable />

      <InviteMembers />
    </div>
  );
};
