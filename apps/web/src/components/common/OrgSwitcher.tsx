import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@coderscreen/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@coderscreen/ui/popover';
import { Skeleton } from '@coderscreen/ui/skeleton';
import {
  RiAddLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiExpandUpDownLine,
  RiLoader2Line,
} from '@remixicon/react';
import { useState } from 'react';
import { OrgAvatar } from '@/components/common/UserAvatar';
import { cn } from '@/lib/utils';
import { useActiveOrg, useSwitchOrganization, useUserOrgs } from '@/query/org.query';
import { CreateOrgDialog } from '../org/CreateOrgDialog';

export const OrgSwitcher = () => {
  const { org, isLoading: isActiveOrgLoading } = useActiveOrg();
  const { orgs, isLoading: isOrgsLoading } = useUserOrgs();
  const { switchOrganization } = useSwitchOrganization();

  const [switchingToOrg, setSwitchingToOrg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orgOpen, setOrgOpen] = useState(false);

  const handleOrgSwitch = async (organizationId: string) => {
    if (org?.id === organizationId) {
      setOpen(false);
      return;
    }
    setSwitchingToOrg(organizationId);

    try {
      await switchOrganization(organizationId);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to switch organization');
    } finally {
      setSwitchingToOrg(null);
    }
  };

  return (
    <div className='px-2 pt-4'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className='flex items-center gap-2 cursor-pointer rounded-lg py-1.5 px-2 transition-colors hover:bg-gray-200/50'>
            {isActiveOrgLoading || !org ? (
              <div className='flex items-center gap-2 w-full'>
                <Skeleton className='h-8 w-8 rounded-lg' />
                <Skeleton className='h-4 w-24' />
              </div>
            ) : (
              <>
                <div className='flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center'>
                  {error && !open ? (
                    <RiErrorWarningLine className='h-5 w-5 text-red-500' />
                  ) : (
                    <OrgAvatar org={org} />
                  )}
                </div>
                <div className='flex-1 min-w-0 flex items-center justify-between'>
                  <p className='text-sm font-medium truncate'>{org.name}</p>
                  {!switchingToOrg ? (
                    <RiExpandUpDownLine className='text-gray-400 size-4' />
                  ) : (
                    <RiLoader2Line className='text-gray-400 size-4 animate-spin' />
                  )}
                </div>
              </>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className='w-[240px] p-0'>
          <Command>
            <CommandList>
              <CommandEmpty>
                {isOrgsLoading ? (
                  <div className='py-6 text-center text-sm'>Loading organizations...</div>
                ) : error ? (
                  <div className='py-6 text-center text-sm text-red-500'>
                    Failed to load organizations
                  </div>
                ) : (
                  'No organization found.'
                )}
              </CommandEmpty>

              {isOrgsLoading ? (
                <div className='px-1 py-2'>
                  <p className='px-2 py-1.5 text-sm text-muted-foreground'>Organizations</p>
                  <div className='animate-pulse space-y-1 py-1'>
                    {Array(4)
                      .fill(0)
                      .map((_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
                        <div key={index} className='px-2 py-1.5 flex items-center gap-2'>
                          <Skeleton className='h-5 w-5 rounded-lg' />
                          <Skeleton className='h-4 w-[80%]' />
                        </div>
                      ))}
                  </div>
                </div>
              ) : error ? (
                <div className='mb-2 border border-red-200 bg-red-100 text-red-800 rounded-md p-3'>
                  <div className='flex items-center gap-2'>
                    <RiErrorWarningLine className='h-4 w-4' />
                    <div className='text-sm'>There was a problem loading your organizations.</div>
                  </div>
                </div>
              ) : (
                <CommandGroup heading='Organizations'>
                  {orgs?.map((organization) => (
                    <CommandItem
                      key={organization.id}
                      onSelect={() => handleOrgSwitch(organization.id)}
                      className={cn(
                        'text-sm transition-all duration-200 ease-in-out',
                        org?.id === organization.id ? 'bg-accent' : 'hover:bg-accent/50'
                      )}
                    >
                      <div className='flex items-center gap-2 truncate'>
                        <div className='h-5 w-5 transition-transform duration-200 hover:scale-110'>
                          {organization.logo ? (
                            <img
                              src={organization.logo}
                              alt={organization.name}
                              className='h-5 w-5 rounded object-cover'
                            />
                          ) : (
                            <div className='h-5 w-5 rounded bg-primary text-white flex items-center justify-center text-xs'>
                              {organization.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className='truncate'>{organization.name}</span>
                      </div>

                      {switchingToOrg === organization.id ? (
                        <RiLoader2Line className='ml-auto h-4 w-4 shrink-0 opacity-50 animate-spin' />
                      ) : (
                        <RiCheckLine
                          className={cn(
                            'ml-auto h-4 w-4 transition-opacity duration-200',
                            org?.id === organization.id && !switchingToOrg
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className={cn('cursor-pointer')}
                  onSelect={() => {
                    setOrgOpen(true);
                  }}
                >
                  <RiAddLine className='mr-2 h-4 w-4' />
                  Create Organization
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateOrgDialog open={orgOpen} onOpenChange={setOrgOpen} />
    </div>
  );
};
