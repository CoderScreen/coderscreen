import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useCurrentRoomId } from '@/lib/params';
import {
  ConnectionStatus,
  ConnectedUser,
  UserPresenceMessage,
  RealtimeConfig,
} from './realtime.query';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getWebsocketUrl = (id: string) => {
  return `${API_URL.replace('https', 'wss').replace('http', 'ws')}/rooms/${id}`;
};

export const getRandomColor = (seed?: string) => {
  // Generate colors that work well with white text
  // Using darker, more saturated colors
  const colors = [
    '#1f2937', // gray-800
    '#374151', // gray-700
    '#4b5563', // gray-600
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#d97706', // amber-600
    '#ca8a04', // yellow-600
    '#65a30d', // lime-600
    '#16a34a', // green-600
    '#0d9488', // teal-600
    '#0891b2', // cyan-600
    '#0284c7', // sky-600
    '#2563eb', // blue-600
    '#7c3aed', // violet-600
    '#9333ea', // purple-600
    '#c026d3', // fuchsia-600
    '#e11d48', // rose-600
  ];

  // Use seed to generate a number for consistent color generation
  const seedHash = seed
    ? Math.abs(
        seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      )
    : Math.random()
        .toString(36)
        .substring(2, 9)
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[seedHash % colors.length];
};

// Shared hook for managing realtime connections
export function useRealtimeConnection(
  config?: RealtimeConfig,
  setCollaborationStatus?: (status: ConnectionStatus) => void
  // userInfo?: { email: string; name: string; id?: string }
) {
  const userInfo: any = null;
  const currentRoomId = useCurrentRoomId();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    status: 'disconnected',
  });

  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Use refs to store stable references to callback functions
  const setCollaborationStatusRef = useRef(setCollaborationStatus);
  const handleUserPresenceMessageRef = useRef<
    ((message: UserPresenceMessage) => void) | null
  >(null);

  const websocketUrl = getWebsocketUrl(currentRoomId);

  // Update ref when prop changes
  useEffect(() => {
    setCollaborationStatusRef.current = setCollaborationStatus;
  }, [setCollaborationStatus]);

  const handleUserPresenceMessage = useCallback(
    (message: UserPresenceMessage) => {
      switch (message.type) {
        case 'user-joined':
          if (message.user) {
            setConnectedUsers((prev) => {
              // Check if user already exists (by email)
              const existingIndex = prev.findIndex(
                (u) => u.email === message.user!.email
              );
              if (existingIndex >= 0) {
                // Update existing user
                const updated = [...prev];
                updated[existingIndex] = message.user!;
                return updated;
              } else {
                // Add new user
                return [...prev, message.user!];
              }
            });
          }
          break;
        case 'user-left':
          if (message.user) {
            setConnectedUsers((prev) =>
              prev.filter((u) => u.email !== message.user!.email)
            );
          }
          break;
        case 'user-list':
          if (message.users) {
            setConnectedUsers(message.users);
          }
          break;
      }
    },
    []
  );

  // Store the function reference in ref
  useEffect(() => {
    handleUserPresenceMessageRef.current = handleUserPresenceMessage;
  }, [handleUserPresenceMessage]);

  const connect = useCallback(() => {
    try {
      const newStatus = { isConnected: false, status: 'connecting' as const };
      setConnectionStatus(newStatus);
      setCollaborationStatusRef.current?.(newStatus);

      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // this is because no way to pass roomId in the middle of the url, so we use a dummy roomId
      const provider = new WebsocketProvider(websocketUrl, 'public/ws', ydoc);
      providerRef.current = provider;

      provider.on('status', ({ status }: { status: string }) => {
        const isConnected = status === 'connected';
        const newStatus: ConnectionStatus = {
          isConnected,
          status: isConnected ? 'connected' : 'disconnected',
        };

        setConnectionStatus(newStatus);
        setCollaborationStatusRef.current?.(newStatus);

        // Send user join message when connected
        if (isConnected && userInfo) {
          const userJoinMessage = {
            type: 'user-join',
            email: userInfo.email,
            name: userInfo.name,
            color: getRandomColor(userInfo.id || userInfo.email),
          };
          provider.ws?.send(JSON.stringify(userJoinMessage));
        }
      });

      provider.on('connection-error', (event: Event) => {
        const errorMessage =
          event instanceof ErrorEvent ? event.message : 'Connection error';
        const errorStatus = {
          isConnected: false,
          status: 'disconnected' as const,
          error: errorMessage,
        };
        setConnectionStatus(errorStatus);
        setCollaborationStatusRef.current?.(errorStatus);
      });

      // Handle custom messages for user presence through the WebSocket directly
      if (provider.ws) {
        const originalOnMessage = provider.ws.onmessage;
        provider.ws.onmessage = (event) => {
          // Call original handler first
          if (originalOnMessage) {
            try {
              originalOnMessage.call(provider.ws!, event);
            } catch (error) {
              console.error('Error calling original onmessage:', error);
            }
          }

          // Handle our custom messages
          try {
            const parsedMessage = JSON.parse(event.data);
            if (
              parsedMessage.type &&
              ['user-joined', 'user-left', 'user-list'].includes(
                parsedMessage.type
              )
            ) {
              handleUserPresenceMessageRef.current?.(parsedMessage);
            }
          } catch (error) {
            // Ignore parsing errors for non-JSON messages
          }
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStatus = {
        isConnected: false,
        status: 'disconnected' as const,
        error: errorMessage,
      };
      setConnectionStatus(errorStatus);
      setCollaborationStatusRef.current?.(errorStatus);
    }
  }, [currentRoomId, websocketUrl, userInfo]);

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    const disconnectedStatus = {
      isConnected: false,
      status: 'disconnected' as const,
    };
    setConnectionStatus(disconnectedStatus);
    setCollaborationStatusRef.current?.(disconnectedStatus);
    setConnectedUsers([]);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    connectedUsers,
    ydoc: ydocRef.current,
    provider: providerRef.current,
    connect,
    disconnect,
  };
}
