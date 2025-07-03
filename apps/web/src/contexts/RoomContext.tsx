import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useCurrentRoomId } from '@/lib/params';
import useYProvider from 'y-partykit/react';
import YPartyKitProvider from 'y-partykit/provider';

interface RoomContextType {
  isConnected: boolean;
  provider: YPartyKitProvider;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:8000';

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const currentRoomId = useCurrentRoomId();
  const [isConnected, setIsConnected] = useState(false);

  const provider = useYProvider({
    party: 'room',
    room: currentRoomId,
    host: `${API_URL}/rooms/${currentRoomId}/public/partykit`,
  });

  // Listen to provider status events to update connection state
  const handleStatus = useCallback(
    ({ status }: { status: string }) => {
      setIsConnected(status === 'connected');
    },
    [setIsConnected]
  );

  useEffect(() => {
    // Set initial state
    setIsConnected(provider.wsconnected);

    // Listen for status changes
    provider.on('status', handleStatus);

    return () => {
      provider.off('status', handleStatus);
    };
  }, [provider]);

  return (
    <RoomContext.Provider
      value={{
        isConnected,
        provider,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};
