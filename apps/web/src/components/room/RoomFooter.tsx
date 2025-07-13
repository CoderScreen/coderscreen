import { RiUserLine } from '@remixicon/react';
import { Tooltip } from '@/components/ui/tooltip';
import { useActiveUsers } from '@/query/realtime/activeUsers.query';
import { useRoomContext } from '@/contexts/RoomContext';
import { cx } from '@/lib/utils';
import { User } from '@/query/realtime/chat.query';

export const RoomFooter = () => {
  const { activeUsers, inactiveUsers } = useActiveUsers();
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
              className={cx('text-xs font-medium', isConnected ? 'text-green-600' : 'text-red-600')}
            >
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Right side - Connected users with tracked users tooltip */}
        <div className='flex items-center gap-3'>
          {/* User avatars */}
          {activeUsers.length > 0 && (
            <div className='flex items-center gap-1.5'>
              {activeUsers.slice(0, 4).map((user) => (
                <div key={user.id} className='flex items-center gap-1'>
                  <UserAvatar user={user} />
                  <span className='text-xs text-muted-foreground max-w-16 truncate'>
                    {user.name}
                  </span>
                </div>
              ))}
              {activeUsers.length > 4 && (
                <Tooltip
                  content={
                    <div className='flex flex-col gap-1'>
                      {activeUsers.slice(0).map((user) => (
                        <div key={user.id} className='flex items-center gap-1'>
                          <UserAvatar user={user} />
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
                      +{activeUsers.length - 4}
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>
          )}

          {/* All Tracked Users Tooltip */}
          {activeUsers.length > 0 && (
            <Tooltip
              content={
                <div className='p-2 max-w-80'>
                  <div className='space-y-3'>
                    {/* Active users section */}
                    {activeUsers.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <div className='w-2 h-2 rounded-full bg-green-500' />
                          <span>Currently Online ({activeUsers.length})</span>
                        </div>
                        <div className='space-y-1'>
                          {activeUsers.map((user) => (
                            <div
                              key={user.id}
                              className='flex items-center gap-2 rounded hover:bg-muted/50'
                            >
                              <UserAvatar user={user} />
                              <div className='flex-1 min-w-0'>
                                <span className='text-sm font-medium truncate'>{user.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inactive users section */}
                    {inactiveUsers.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <div className='w-2 h-2 rounded-full bg-gray-400' />
                          <span>Previously Joined ({inactiveUsers.length})</span>
                        </div>
                        <div className='space-y-1 max-h-32 overflow-y-auto'>
                          {inactiveUsers.map((user) => (
                            <div
                              key={user.id}
                              className='flex items-center gap-2 rounded hover:bg-muted/50'
                            >
                              <UserAvatar user={user} />
                              <div className='flex-1 min-w-0'>
                                <span className='text-sm font-medium truncate'>{user.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }
            >
              <div className='flex items-center gap-1 cursor-pointer hover:bg-muted/50 p-1 rounded'>
                <RiUserLine className='w-4 h-4 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  All ({activeUsers.length + inactiveUsers.length})
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ user }: { user: User }) => {
  return (
    <div
      className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-background'
      style={{ backgroundColor: user.color }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
};
