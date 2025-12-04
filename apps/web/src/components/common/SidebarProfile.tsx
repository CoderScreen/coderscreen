import { Button } from '@coderscreen/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { Skeleton } from '@coderscreen/ui/skeleton';
import { RiExpandUpDownLine, RiLogoutBoxLine, RiUserLine } from '@remixicon/react';
import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSession, useSignOut } from '@/query/auth.query';
import { useActiveOrg } from '@/query/org.query';

export const SidebarProfile = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isCollapsed } = useSidebar();
  const { org, isLoading: orgLoading } = useActiveOrg();
  const { signOut, isLoading: isSigningOut } = useSignOut();
  const router = useRouter();

  const isLoading = useMemo(() => {
    return isSessionLoading || orgLoading;
  }, [isSessionLoading, orgLoading]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handlePageChange = (page: string) => {
    router.navigate({ to: page });
  };

  return (
    <div className='space-y-3'>
      {isLoading || !user || !org ? (
        <div className='flex items-center gap-3 py-1.5 px-2'>
          <Skeleton className='w-8 h-8 rounded-lg' />
          {!isCollapsed && (
            <div className='flex-1 space-y-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-2'>
          {/* User Info with Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='flex items-center gap-2 cursor-pointer rounded-lg py-1.5 px-2 transition-colors hover:bg-gray-200/50'>
                <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center border'>
                  <span className='text-white text-sm font-medium'>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className='flex-1 min-w-0 overflow-hidden flex items-center justify-between'>
                  <div>
                    <p className='text-xs font-medium text-gray-700 truncate'>{user.name}</p>
                    <p className='text-xs font-medium text-gray-900 truncate'>{user.email}</p>
                  </div>
                  <RiExpandUpDownLine className='text-gray-400 size-4' />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <div className='flex items-center gap-2 hover:bg-white p-1'>
                <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center border'>
                  <span className='text-white text-sm font-medium'>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className='flex-1 min-w-0 flex items-center justify-between'>
                  <div>
                    <p className='text-xs'>{user.name}</p>
                    <p className='text-xs text-muted-foreground'>{user.email}</p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className='flex items-center'
                onClick={() => handlePageChange('/profile')}
              >
                <DropdownMenuIconWrapper>
                  <RiUserLine className='size-4' />
                </DropdownMenuIconWrapper>
                Profile
              </DropdownMenuItem>

              {/* <DropdownMenuItem className='flex items-center'>
                <DropdownMenuIconWrapper>
                  <RiBankCardLine className='size-4' />
                </DropdownMenuIconWrapper>
                Billing
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className='flex items-center'>
                <DropdownMenuIconWrapper>
                  <RiSettingsLine className='size-4' />
                </DropdownMenuIconWrapper>
                Settings
              </DropdownMenuItem> */}

              {/* <DropdownMenuSeparator /> */}

              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className='flex items-center p-0'
              >
                <Button
                  variant='ghost'
                  icon={RiLogoutBoxLine}
                  iconClassName='text-muted-foreground'
                >
                  Sign out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
