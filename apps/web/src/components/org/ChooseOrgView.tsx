import { RiAddLine, RiArrowRightLine, RiBuilding2Line } from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { OrgAvatar } from '@/components/common/UserAvatar';
import { CreateOrgDialog } from '@/components/org/CreateOrgDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { useSwitchOrganization, useUserOrgs } from '@/query/org.query';

export const ChooseOrgView = () => {
  const navigate = useNavigate();
  const { orgs, isLoading } = useUserOrgs();
  const { switchOrganization, isLoading: isSwitching } = useSwitchOrganization();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSwitchOrg = async (orgId: string) => {
    await switchOrganization(orgId);

    // redirect to home page
    await navigate({ to: '/', reloadDocument: true });
  };

  return (
    <div className='w-full px-4'>
      {/* Header */}
      <div className='flex items-center justify-between py-4'>
        <div className='flex flex-col'>
          <SmallHeader>Your Organizations</SmallHeader>
          <MutedText>Choose your active organization</MutedText>
        </div>

        <div className='flex items-center gap-2'>
          <Button icon={RiAddLine} onClick={() => setIsCreateDialogOpen(true)}>
            <span>New Organization</span>
          </Button>
        </div>
      </div>

      {/* Organizations List */}
      <div className='space-y-4'>
        {isLoading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {[...Array(6)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: needed for skeleton loading
              <Card key={i} className='p-6 animate-pulse'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
                  <div className='flex-1'>
                    <div className='h-4 bg-gray-200 rounded mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                  </div>
                </div>
                <div className='h-8 bg-gray-200 rounded'></div>
              </Card>
            ))}
          </div>
        ) : orgs && orgs.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {orgs.map((org) => {
              return (
                <Card key={org.id} className='p-6 hover:shadow-md transition-shadow'>
                  <div className='flex items-center gap-3 mb-4'>
                    <OrgAvatar org={org} />
                    <h3 className='font-medium text-gray-900 truncate'>{org.name}</h3>
                  </div>

                  <Button
                    variant='secondary'
                    className='w-full'
                    onClick={() => handleSwitchOrg(org.id)}
                    isLoading={isSwitching}
                    iconPosition='right'
                    icon={RiArrowRightLine}
                  >
                    Switch to this organization
                  </Button>
                </Card>
              );
            })}

            {/* Create Organization Card */}
            <Card
              className='p-6 border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer'
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <div className='flex flex-col items-center justify-center h-full text-center'>
                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                  <RiAddLine className='w-6 h-6 text-gray-400' />
                </div>
                <h3 className='font-medium text-gray-900 mb-2'>Create Organization</h3>
              </div>
            </Card>
          </div>
        ) : (
          <Card className='p-8 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <RiBuilding2Line className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No organizations yet</h3>
            <p className='text-gray-500 mb-6'>Create your first organization to get started</p>
            <Button icon={RiAddLine} onClick={() => setIsCreateDialogOpen(true)}>
              Create Organization
            </Button>
          </Card>
        )}
      </div>

      {/* Create Organization Dialog */}
      <CreateOrgDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
};
