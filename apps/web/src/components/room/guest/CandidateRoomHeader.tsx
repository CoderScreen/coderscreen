import { useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cx } from '@/lib/utils';
import { usePublicRoom } from '@/query/publicRoom.query';
import { Button } from '@/components/ui/button';
import { RiLogoutBoxLine } from '@remixicon/react';
import { useCurrentRoomId } from '@/lib/params';

const APP_URL = import.meta.env.VITE_APP_URL as string;
if (!APP_URL) {
  throw new Error('VITE_APP_URL is not set');
}

interface CandidateRoomHeaderProps {
  onLogout?: () => void;
}

export const CandidateRoomHeader = ({ onLogout }: CandidateRoomHeaderProps) => {
  const { publicRoom, isLoading } = usePublicRoom();
  const { connectionStatus } = useRoomContext();
  const currentRoomId = useCurrentRoomId();

  const handleLogout = () => {
    // Clear guest info from localStorage
    localStorage.removeItem(`guest-info-${currentRoomId}`);
    // Call the logout callback if provided
    onLogout?.();
  };

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
