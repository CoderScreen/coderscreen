import { useEffect, useState, useMemo } from 'react';
import { useSession } from '@/query/auth.query';
import { ConnectionStatus, RealtimeConfig } from './realtime.query';
import {
  useRealtimeConnection,
  useInstructionEditor,
  getRandomColor,
} from './collaboration.utils';

// Hook for host instruction editor collaboration
export function useHostInstructionEditorCollaboration(
  config: RealtimeConfig,
  setCollaborationStatus?: (status: ConnectionStatus) => void
) {
  const { user } = useSession();

  const { ydoc, provider, connectionStatus, connectedUsers } =
    useRealtimeConnection(
      config,
      setCollaborationStatus,
      user
        ? {
            email: user.email,
            name: user.name || user.email,
            id: user.id,
          }
        : undefined
    );

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ydoc && provider) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [ydoc, provider]);

  const userInfo = useMemo(
    () => ({
      id: Math.random().toString(36).substring(2, 9),
      name: user?.name ?? `User ${Math.floor(Math.random() * 1000)}`,
      color: getRandomColor(user?.id),
    }),
    [user?.name, user?.id]
  );

  const editor = useInstructionEditor(ydoc, provider, isReady, userInfo);

  return {
    editor,
    connectionStatus,
    connectedUsers,
    isReady,
    ydoc,
    provider,
  };
}
