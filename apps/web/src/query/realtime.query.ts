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
      const provider = new WebsocketProvider(websocketUrl, 'public', ydoc);
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

// Hook for instruction editor collaboration
export function useInstructionEditorCollaboration(
  config: RealtimeConfig,
  setCollaborationStatus?: (status: ConnectionStatus) => void
) {
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
        ...(isReady && ydoc && provider
          ? [
              Collaboration.configure({
                document: ydoc,
              }),
              CollaborationCursor.configure({
                provider: provider,
                user: {
                  id: Math.random().toString(36).substr(2, 9),
                  name: `User ${Math.floor(Math.random() * 1000)}`,
                  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                },
              }),
            ]
          : []),
      ],
      content: '',
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

// Utility functions for room management
export const roomUtils = {
  // Get room info
  async getRoomInfo(roomId: string, baseUrl?: string): Promise<any> {
    const url =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000');
    const response = await fetch(`${url}/rooms/${roomId}/public/info`);
    if (!response.ok) throw new Error('Failed to get room info');
    return response.json();
  },

  // Get room status
  async getRoomStatus(roomId: string, baseUrl?: string): Promise<any> {
    const url =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000');
    const response = await fetch(`${url}/rooms/${roomId}/public/status`);
    if (!response.ok) throw new Error('Failed to get room status');
    return response.json();
  },

  // Reset code document
  async resetCodeDocument(roomId: string, baseUrl?: string): Promise<void> {
    const url =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000');
    const response = await fetch(`${url}/rooms/${roomId}/public/code/reset`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset code document');
  },

  // Reset instructions document
  async resetInstructionsDocument(
    roomId: string,
    baseUrl?: string
  ): Promise<void> {
    const url =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000');
    const response = await fetch(
      `${url}/rooms/${roomId}/public/instructions/reset`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) throw new Error('Failed to reset instructions document');
  },

  // Reset both documents
  async resetAllDocuments(roomId: string, baseUrl?: string): Promise<void> {
    const url =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:8000');
    const response = await fetch(`${url}/rooms/${roomId}/public/reset`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset documents');
  },
};

// Default configurations
export const defaultConfigs = {
  code: {
    documentType: 'code' as const,
    baseUrl:
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
        : 'ws://localhost:8000',
  },
  instructions: {
    documentType: 'instructions' as const,
    baseUrl:
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
        : 'ws://localhost:8000',
  },
};
