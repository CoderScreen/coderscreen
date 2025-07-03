import { useAuth } from '@/contexts/AuthContext';
import { GuestRoomView } from './guest/GuestRoomView';
import { HostRoomView } from '@/components/room/host/HostRoomView';

export const RoomView = () => {
  const { isAuthenticated, isInitalLoading } = useAuth();

  // Show loading while auth is initializing
  if (isInitalLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
          <p className='text-gray-600'>Loading room...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show host view
  if (isAuthenticated) {
    return <HostRoomView />;
  }

  // If user is not authenticated, show guest view (which handles its own state)
  return <GuestRoomView />;
};
