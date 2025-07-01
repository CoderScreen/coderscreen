import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCurrentRoomId } from '@/lib/params';
import { useSession } from '@/query/auth.query';
import Placeholder from '@tiptap/extension-placeholder';

// Configuration types
export interface RealtimeConfig {
  documentType: 'code' | 'instructions';
  onStatusChange?: (status: 'connected' | 'disconnected') => void;
  onError?: (error: Error) => void;
}

export interface ConnectionStatus {
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  error?: string;
}

// Enhanced connection status for unified connections
export interface UnifiedConnectionStatus {
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  collaborationConnected: boolean;
  executionConnected: boolean;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getWebsocketUrl = (id: string) => {
  return `${API_URL.replace('https', 'wss').replace('http', 'ws')}/rooms/${id}`;
};

// Hook for managing realtime connections
export function useRealtimeConnection(
  config?: RealtimeConfig,
  setCollaborationStatus?: (status: ConnectionStatus) => void
) {
  const currentRoomId = useCurrentRoomId();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    status: 'disconnected',
  });

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  const websocketUrl = getWebsocketUrl(currentRoomId);

  const connect = useCallback(() => {
    try {
      const newStatus = { isConnected: false, status: 'connecting' as const };
      setConnectionStatus(newStatus);
      setCollaborationStatus?.(newStatus);

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
        setCollaborationStatus?.(newStatus);
        config?.onStatusChange?.(isConnected ? 'connected' : 'disconnected');
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
        setCollaborationStatus?.(errorStatus);
        config?.onError?.(new Error(errorMessage));
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStatus = {
        isConnected: false,
        status: 'disconnected' as const,
        error: errorMessage,
      };
      setConnectionStatus(errorStatus);
      setCollaborationStatus?.(errorStatus);
      config?.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    }
  }, [
    currentRoomId,
    websocketUrl,
    config?.onStatusChange,
    config?.onError,
    setCollaborationStatus,
  ]);

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
    setCollaborationStatus?.(disconnectedStatus);
  }, [setCollaborationStatus]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    ydoc: ydocRef.current,
    provider: providerRef.current,
    connect,
    disconnect,
  };
}

// Unified connection hook that combines both realtime collaboration and code execution
export function useUnifiedConnection() {
  const [unifiedStatus, setUnifiedStatus] = useState<UnifiedConnectionStatus>({
    isConnected: false,
    status: 'disconnected',
    collaborationConnected: false,
    executionConnected: false,
  });

  // Track individual connection states
  const [collaborationStatus, setCollaborationStatus] =
    useState<ConnectionStatus>({
      isConnected: false,
      status: 'disconnected',
    });
  const [executionStatus, setExecutionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    status: 'disconnected',
  });

  // Update unified status when individual statuses change
  useEffect(() => {
    const isConnected =
      collaborationStatus.isConnected || executionStatus.isConnected;
    const status = isConnected ? 'connected' : 'disconnected';

    setUnifiedStatus({
      isConnected,
      status,
      collaborationConnected: collaborationStatus.isConnected,
      executionConnected: executionStatus.isConnected,
      error: collaborationStatus.error || executionStatus.error,
    });
  }, [collaborationStatus, executionStatus]);

  return {
    connectionStatus: unifiedStatus,
    collaborationStatus,
    executionStatus,
    setCollaborationStatus,
    setExecutionStatus,
  };
}

// Hook for code editor collaboration
export function useCodeEditorCollaboration(
  config: RealtimeConfig,
  editorRef: editor.IStandaloneCodeEditor | undefined,
  setCollaborationStatus?: (status: ConnectionStatus) => void
) {
  const { ydoc, provider, connectionStatus } = useRealtimeConnection(
    config,
    setCollaborationStatus
  );
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!editorRef || !ydoc || !provider) return;

    const ytext = ydoc.getText('monaco');

    // Attach Yjs to Monaco
    const binding = new MonacoBinding(
      ytext,
      editorRef.getModel() as editor.ITextModel,
      new Set([editorRef]),
      provider.awareness
    );
    bindingRef.current = binding;

    return () => {
      binding?.destroy();
    };
  }, [editorRef, ydoc, provider]);

  return {
    connectionStatus,
    ydoc,
    provider,
  };
}

const getRandomColor = () => {
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

  return colors[Math.floor(Math.random() * colors.length)];
};

// Hook for instruction editor collaboration
export function useInstructionEditorCollaboration(
  config: RealtimeConfig,
  setCollaborationStatus?: (status: ConnectionStatus) => void
) {
  const { user } = useSession();

  const { ydoc, provider, connectionStatus } = useRealtimeConnection(
    config,
    setCollaborationStatus
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ydoc && provider) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [ydoc, provider]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Disable history as it's handled by Yjs
        }),
        Placeholder.configure({
          placeholder: 'Write your instructions here...',
        }),
        ...(isReady && ydoc && provider
          ? [
              Collaboration.configure({
                document: ydoc,
              }),
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  id: Math.random().toString(36).substring(2, 9),
                  name:
                    user?.name ?? `User ${Math.floor(Math.random() * 1000)}`,
                  color: getRandomColor(),
                },
              }),
            ]
          : []),
      ],
    },
    [isReady, ydoc, provider]
  );

  return {
    editor,
    connectionStatus,
    isReady,
    ydoc,
    provider,
  };
}
