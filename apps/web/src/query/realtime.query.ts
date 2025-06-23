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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getWebsocketUrl = (id: string) => {
  return `${API_URL.replace('https', 'wss').replace('http', 'ws')}/rooms/${id}`;
};

// Hook for managing realtime connections
export function useRealtimeConnection(config: RealtimeConfig) {
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
      setConnectionStatus({ isConnected: false, status: 'connecting' });

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
        config.onStatusChange?.(isConnected ? 'connected' : 'disconnected');
      });

      provider.on(
        'connection-error',
        (event: Event, provider: WebsocketProvider) => {
          const errorMessage =
            event instanceof ErrorEvent ? event.message : 'Connection error';
          setConnectionStatus({
            isConnected: false,
            status: 'disconnected',
            error: errorMessage,
          });
          config.onError?.(new Error(errorMessage));
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus({
        isConnected: false,
        status: 'disconnected',
        error: errorMessage,
      });
      config.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
    }
  }, [currentRoomId, websocketUrl, config.onStatusChange, config.onError]);

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    setConnectionStatus({ isConnected: false, status: 'disconnected' });
  }, []);

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

// Hook for code editor collaboration
export function useCodeEditorCollaboration(
  config: RealtimeConfig,
  editorRef: editor.IStandaloneCodeEditor | undefined
) {
  const { ydoc, provider, connectionStatus } = useRealtimeConnection(config);
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
export function useInstructionEditorCollaboration(config: RealtimeConfig) {
  const { ydoc, provider, connectionStatus } = useRealtimeConnection(config);
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
