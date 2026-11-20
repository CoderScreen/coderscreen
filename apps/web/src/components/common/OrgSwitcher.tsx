import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { Skeleton } from '@coderscreen/ui/skeleton';
import { RiCheckLine, RiExpandUpDownLine } from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { OrgAvatar } from '@/components/common/UserAvatar';
import { useActiveOrg, useSwitchOrganization, useUserOrgs } from '@/query/org.query';

export const OrgSwitcher = () => {
  const { org, isLoading } = useActiveOrg();
  const { orgs } = useUserOrgs();
  const { switchOrganization, isLoading: isSwitching } = useSwitchOrganization();
  const navigate = useNavigate();

  const canSwitch = (orgs?.length ?? 0) > 1;

  const handleSwitch = async (organizationId: string) => {
    if (organizationId === org?.id) return;
    await switchOrganization(organizationId);
    await navigate({ to: '/', reloadDocument: true });
  };

  if (isLoading || !org) {
    return (
      <div className='flex h-16 items-center px-2'>
        <div className='flex items-center gap-2 w-full px-2'>
          <Skeleton className='h-8 w-8 rounded-lg' />
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
    );
  }

  const current = (
    <>
      <div className='flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center'>
        <OrgAvatar org={org} />
      </div>
      <div className='flex-1 min-w-0 text-left'>
        <p className='text-sm font-medium truncate'>{org.name}</p>
      </div>
    </>
  );

  if (!canSwitch) {
    return (
      <div className='flex h-16 items-center px-2'>
        <div className='flex items-center gap-2 rounded-lg px-2 w-full'>{current}</div>
      </div>
    );
  }

  return (
    <div className='flex h-16 items-center px-2'>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isSwitching}
          className='flex items-center gap-2 rounded-lg px-2 py-1.5 w-full hover:bg-gray-100 transition-colors'
        >
          {current}
          <RiExpandUpDownLine className='h-4 w-4 shrink-0 text-gray-500' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='min-w-56'>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {orgs?.map((o) => (
            <DropdownMenuItem
              key={o.id}
              className='flex items-center gap-2'
              onClick={() => handleSwitch(o.id)}
            >
              <OrgAvatar org={o} />
              <span className='flex-1 truncate text-sm'>{o.name}</span>
              {o.id === org.id && <RiCheckLine className='h-4 w-4 shrink-0' />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
