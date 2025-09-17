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
  currentLanguage: RoomSchema['language'] | undefined;
  setLanguage: (language: RoomSchema['language']) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

const PARTY_NAME = 'room';
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL is not set');
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const currentRoomId = useCurrentRoomId();
  const [isConnected, setIsConnected] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<RoomSchema['status'] | undefined>(undefined);
  const [currentLanguage, setCurrentLanguage] = useState<RoomSchema['language'] | undefined>(
    undefined
  );

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

    // Subscribe to language field changes in the y.js document
    const subscribeToLanguage = () => {
      if (!provider.doc) {
        console.warn('Provider document not available');
        return () => {};
      }

      const languageField = provider.doc.getText('language');
      if (!languageField) {
        console.warn('Language field not found in document');
        return () => {};
      }

      // Set initial language
      const initialLanguage = languageField.toString() as RoomSchema['language'];
      setCurrentLanguage(initialLanguage);

      // Subscribe to changes
      const handleLanguageChange = (event: { target: { toString: () => string } }) => {
        const newLanguage = event.target.toString() as RoomSchema['language'];
        setCurrentLanguage(newLanguage);
      };

      languageField.observe(handleLanguageChange);

      // Return unsubscribe function
      return () => {
        languageField.unobserve(handleLanguageChange);
      };
    };

    // Subscribe to both status and language field changes
    const unsubscribeStatus = subscribeToStatus();
    const unsubscribeLanguage = subscribeToLanguage();

    return () => {
      provider.off('status', handleStatus);
      unsubscribeStatus();
      unsubscribeLanguage();
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

  // Set language in the Yjs document
  const setLanguage = useCallback(
    (language: RoomSchema['language']) => {
      if (!provider) return;

      const languageField = provider.doc.getText('language');

      provider.doc.transact(() => {
        languageField.delete(0, languageField.length);
        languageField.insert(0, language);
      });
    },
    [provider]
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
        currentLanguage,
        setLanguage,
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
