import React, { createContext, useContext, ReactNode } from 'react';
import {
  useUnifiedConnection,
  UnifiedConnectionStatus,
} from '@/query/realtime.query';

interface RoomContextType {
  connectionStatus: UnifiedConnectionStatus;
  setCollaborationStatus: (status: any) => void;
  setExecutionStatus: (status: any) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { connectionStatus, setCollaborationStatus, setExecutionStatus } =
    useUnifiedConnection();

  return (
    <RoomContext.Provider
      value={{
        connectionStatus,
        setCollaborationStatus,
        setExecutionStatus,
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
