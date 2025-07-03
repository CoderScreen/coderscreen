import { RiUserLine, RiTimeLine, RiSignalTowerLine } from '@remixicon/react';
import { Tooltip } from '@/components/ui/tooltip';
import {
  useActiveUsers,
  ConnectedUser,
} from '@/query/realtime/activeUsers.query';
import { useRoomContext } from '@/contexts/RoomContext';
import { cx } from '@/lib/utils';

export const RoomFooter = () => {
  const { uniqueUsers } = useActiveUsers();
  const { isConnected } = useRoomContext();

  return (
    <div className='border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex items-center justify-between px-6 py-3'>
        {/* Left side - Connection status and session info */}
        <div className='flex items-center gap-6'>
          {/* Connection Status */}
          <div className='flex items-center gap-2'>
            <div
              className={cx(
                'w-2 h-2 rounded-full animate-pulse',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span
              className={cx(
                'text-xs font-medium',
                isConnected ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Right side - Connected users */}
        <div className='flex items-center gap-3'>
          {/* User avatars */}
          {uniqueUsers.length > 0 && (
            <div className='flex items-center gap-1.5'>
              {uniqueUsers.slice(0, 4).map((user: ConnectedUser) => (
                <div key={user.clientId} className='flex items-center gap-1'>
                  <div
                    className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-background transition-transform cursor-pointer'
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className='text-xs text-muted-foreground max-w-16 truncate'>
                    {user.name}
                  </span>
                </div>
              ))}
              {uniqueUsers.length > 4 && (
                <Tooltip
                  content={
                    <div className='flex flex-col gap-1'>
                      {uniqueUsers.slice(0).map((user) => (
                        <div
                          key={user.clientId}
                          className='flex items-center gap-1'
                        >
                          <div
                            className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-background transition-transform cursor-pointer'
                            style={{ backgroundColor: user.color }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className='text-xs text-muted-foreground max-w-16 truncate'>
                            {user.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className='flex flex-col items-center gap-1'>
                    <div className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold bg-muted text-muted-foreground border-2 border-background'>
                      +{uniqueUsers.length - 4}
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
