import { useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cx } from '@/lib/utils';
import { usePublicRoom } from '@/query/publicRoom.query';
import { Button } from '@/components/ui/button';
import { RiLogoutBoxLine, RiUserLine } from '@remixicon/react';
import { useCurrentRoomId } from '@/lib/params';
import { Tooltip } from '@/components/ui/tooltip';
import { ConnectedUser } from '@/query/realtime.query';

const APP_URL = import.meta.env.VITE_APP_URL as string;
if (!APP_URL) {
  throw new Error('VITE_APP_URL is not set');
}

interface CandidateRoomHeaderProps {
  onLogout?: () => void;
}

export const CandidateRoomHeader = ({ onLogout }: CandidateRoomHeaderProps) => {
  const { publicRoom, isLoading } = usePublicRoom();
  const { connectionStatus, connectedUsers } = useRoomContext();
  const currentRoomId = useCurrentRoomId();

  const handleLogout = () => {
    // Clear guest info from localStorage
    localStorage.removeItem(`guest-info-${currentRoomId}`);
    // Call the logout callback if provided
    onLogout?.();
  };

  // Get unique users by email (in case of multiple connections)
  const uniqueUsers = connectedUsers.reduce(
    (acc: ConnectedUser[], user: ConnectedUser) => {
      if (!acc.find((u: ConnectedUser) => u.email === user.email)) {
        acc.push(user);
      }
      return acc;
    },
    [] as ConnectedUser[]
  );

  return (
    <div className='flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center gap-2'>
        <div className='max-w-80'>
          {isLoading ? (
            <Skeleton className='w-42 h-6' />
          ) : (
            <span className='w-full text-lg cursor-pointer hover:text-muted-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap'>
              {publicRoom?.title}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <div
            className={cx(
              'w-2 h-2 rounded-full',
              connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span
            className={cx(
              connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
            )}
          >
            {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Connected Users */}
        <div className='flex items-center gap-2 ml-4'>
          <RiUserLine className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm text-muted-foreground'>
            {uniqueUsers.length} connected
          </span>
          {uniqueUsers.length > 0 && (
            <div className='flex items-center gap-1'>
              {uniqueUsers
                .slice(0, 3)
                .map((user: ConnectedUser, index: number) => (
                  <Tooltip key={user.clientId} content={user.email}>
                    <div
                      className='w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white'
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Tooltip>
                ))}
              {uniqueUsers.length > 3 && (
                <span className='text-xs text-muted-foreground'>
                  +{uniqueUsers.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {onLogout && (
        <Button
          variant='secondary'
          onClick={handleLogout}
          icon={RiLogoutBoxLine}
        >
          Leave Room
        </Button>
      )}
    </div>
  );
};
