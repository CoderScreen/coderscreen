import { Skeleton } from '@/components/ui/skeleton';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSession, useSignOut } from '@/query/auth.query';
import { useActiveOrg } from '@/query/org.query';
import { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuIconWrapper,
} from '@/components/ui/dropdown';
import {
  RiUserLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiBankCardLine,
  RiExpandUpDownLine,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const SidebarProfile = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { isCollapsed } = useSidebar();
  const { org, isLoading: orgLoading } = useActiveOrg();
  const { signOut, isLoading: isSigningOut } = useSignOut();

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

  return (
    <div className='space-y-3'>
      {isLoading || !user || !org ? (
        <div className='flex items-center gap-3'>
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
                <div className='flex-1 min-w-0 flex items-center justify-between'>
                  <div>
                    <p className='text-xs font-medium text-gray-700 truncate'>
                      {user.name}
                    </p>
                    <p className='text-xs font-medium text-gray-900 truncate'>
                      {user.email}
                    </p>
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
                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Link to='/profile' className='flex items-center'>
                  <DropdownMenuIconWrapper>
                    <RiUserLine className='size-4' />
                  </DropdownMenuIconWrapper>
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className='flex items-center'>
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
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className='flex items-center p-0'
              >
                <Button variant='ghost' icon={RiLogoutBoxLine}>
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
