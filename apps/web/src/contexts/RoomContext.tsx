import { PublicRoomSchema, RoomSchema } from '@coderscreen/api/schema/room';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import YPartyKitProvider from 'y-partykit/provider';
import useYProvider from 'y-partykit/react';
import { useCurrentRoomId } from '@/lib/params';
import { usePublicRoom } from '@/query/publicRoom.query';

interface RoomContextType {
  room: PublicRoomSchema | undefined;
  isReadOnly: boolean;
  isConnected: boolean;
  provider: YPartyKitProvider;
  subscribeToStatus: (callback?: (status: string) => void) => () => void;
  currentStatus: RoomSchema['status'] | undefined;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

const PARTY_NAME = 'room';
const API_URL = 'http://localhost:8000';

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const currentRoomId = useCurrentRoomId();
  const [isConnected, setIsConnected] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<RoomSchema['status'] | undefined>(undefined);

  const { publicRoom } = usePublicRoom();

  const provider = useYProvider({
    party: PARTY_NAME,
    room: currentRoomId,
    host: `${API_URL}/rooms/${currentRoomId}/public/connect`,
  });

  // Listen to provider status events to update connection state
  const handleStatus = useCallback(({ status }: { status: string }) => {
    setIsConnected(status === 'connected');
  }, []);

  useEffect(() => {
    setIsConnected(provider.wsconnected);

    // Listen for status changes
    provider.on('status', handleStatus);

    // Subscribe to status field changes in the y.js document
    const subscribeToStatus = (callback?: (status: string) => void) => {
      if (!provider.doc) {
        console.warn('Provider document not available');
        return () => {};
      }

      // Get or create the status field in the document
      const statusField = provider.doc.getText('status');
      if (!statusField) {
        console.warn('Status field not found in document');
        return () => {};
      }

      // Set initial status
      const initialStatus = statusField.toString() as RoomSchema['status'];
      setCurrentStatus(initialStatus);
      callback?.(initialStatus);

      // Subscribe to changes
      const handleStatusChange = (event: { target: { toString: () => string } }) => {
        const newStatus = event.target.toString() as RoomSchema['status'];
        setCurrentStatus(newStatus);
        callback?.(newStatus);
      };

      statusField.observe(handleStatusChange);

      // Return unsubscribe function
      return () => {
        statusField.unobserve(handleStatusChange);
      };
    };

    // Subscribe to status field changes
    const unsubscribe = subscribeToStatus();

    return () => {
      provider.off('status', handleStatus);
      unsubscribe();
    };
  }, [provider, handleStatus]);

  const isReadOnly = useMemo(() => {
    return currentStatus !== 'active';
  }, [currentStatus]);

  // Create a wrapper function for subscribeToStatus that can be called from outside
  const subscribeToStatus = useCallback(
    (callback?: (status: string) => void) => {
      if (!provider.doc) {
        console.warn('Provider document not available');
        return () => {};
      }

      // Get or create the status field in the document
      const statusField = provider.doc.getText('status');
      if (!statusField) {
        console.warn('Status field not found in document');
        return () => {};
      }

      // Set initial status
      const initialStatus = statusField.toString() as RoomSchema['status'];
      setCurrentStatus(initialStatus);
      callback?.(initialStatus);

      // Subscribe to changes
      const handleStatusChange = (event: { target: { toString: () => string } }) => {
        const newStatus = event.target.toString() as RoomSchema['status'];
        setCurrentStatus(newStatus);
        callback?.(newStatus);
      };

      statusField.observe(handleStatusChange);

      // Return unsubscribe function
      return () => {
        statusField.unobserve(handleStatusChange);
      };
    },
    [provider.doc]
  );

  return (
    <RoomContext.Provider
      value={{
        room: publicRoom,
        isReadOnly,
        isConnected,
        provider,
        subscribeToStatus,
        currentStatus,
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
