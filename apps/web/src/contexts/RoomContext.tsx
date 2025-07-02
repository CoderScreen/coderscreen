import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from 'react';
import { PartySocket } from 'partysocket';
import * as Y from 'yjs';
import { useCurrentRoomId } from '@/lib/params';
import { ConnectedUser, ConnectionStatus } from '@/query/realtime.query';
import useYProvider from 'y-partykit/react';
import YPartyKitProvider from 'y-partykit/provider';

interface RoomContextType {
  connectedUsers: ConnectedUser[];
  provider: YPartyKitProvider;
  setConnectedUsers: (users: ConnectedUser[]) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const currentRoomId = useCurrentRoomId();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const provider = useYProvider({
    room: currentRoomId,
    host: 'http://localhost:8080',
  });

  console.log('provider', provider);

  provider.on('*', () => console.log('open'));

  // Handle custom messages for user presence
  provider.on('message', (event: MessageEvent) => {
    console.log('message', event);
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'user-joined' && message.user) {
        setConnectedUsers((prev) => {
          const existingIndex = prev.findIndex(
            (u) => u.email === message.user.email
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = message.user;
            return updated;
          } else {
            return [...prev, message.user];
          }
        });
      } else if (message.type === 'user-left' && message.user) {
        setConnectedUsers((prev) =>
          prev.filter((u) => u.email !== message.user.email)
        );
      } else if (message.type === 'user-list' && message.users) {
        setConnectedUsers(message.users);
      }
    } catch (error) {
      // Ignore parsing errors for non-JSON messages
    }
  });

  return (
    <RoomContext.Provider
      value={{
        connectedUsers,
        provider,
        setConnectedUsers,
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
