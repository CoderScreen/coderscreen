import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentRoomId } from '@/lib/params';
import * as Y from 'yjs';
import { ConnectionStatus } from './realtime.query';

export interface CodeExecutionStatus {
  isRunning: boolean;
  output: string;
  error?: string;
  timestamp: number;
}

export interface CodeExecutionState {
  isRunning: boolean;
  output?: string;
  error?: string;
  timestamp: number;
}

export interface CodeExecutionMessage {
  type:
    | 'execution_start'
    | 'execution_output'
    | 'execution_complete'
    | 'execution_error'
    | 'execution_state'
    | 'sync'
    | 'update';
  data:
    | {
        output?: string;
        error?: string;
        timestamp: number;
      }
    | number[]; // For Y.js updates
}

// Type guard to check if data is execution data
function isExecutionData(
  data: any
): data is { output?: string; error?: string; timestamp: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.timestamp === 'number'
  );
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getCodeExecutionWebsocketUrl = (roomId: string) => {
  return `${API_URL.replace('https', 'wss').replace('http', 'ws')}/rooms/${roomId}/public/ws`;
};

export function useCodeExecutionWebSocket(
  setExecutionStatus?: (status: ConnectionStatus) => void
) {
  const currentRoomId = useCurrentRoomId();
  const [data, setData] = useState<CodeExecutionStatus>({
    isRunning: false,
    output: '',
    timestamp: Date.now(),
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getCodeExecutionWebsocketUrl(currentRoomId));
      wsRef.current = ws;

      // Initialize Y.js document
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // Set up execution state observer
      const executionState = ydoc.getMap('execution');
      executionState.observe((event) => {
        console.log('Execution state changed:', event);
        const status = executionState.get('status') as
          | CodeExecutionState
          | undefined;
        if (status) {
          setData({
            isRunning: status.isRunning || false,
            output: status.output || '',
            error: status.error,
            timestamp: status.timestamp || Date.now(),
          });
        }
      });

      ws.onopen = () => {
        console.log('Code execution WebSocket connected');

        // Update connection status if callback provided
        setExecutionStatus?.({
          isConnected: true,
          status: 'connected',
        });

        // Send sync message to get current state
        ws.send(JSON.stringify({ type: 'execution', messageType: 'sync' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: CodeExecutionMessage = JSON.parse(event.data);
          console.log('Received message:', message);

          switch (message.type) {
            case 'sync':
              console.log(
                'Received sync message:',
                message,
                Array.isArray(message.data),
                ydocRef.current
              );
              if (Array.isArray(message.data) && !!ydocRef.current) {
                // Apply the received document state
                const update = new Uint8Array(message.data);
                Y.applyUpdate(ydocRef.current, update);

                // Manually read the current execution state after sync
                const executionState = ydocRef.current.getMap('execution');
                const status = executionState.get('status') as
                  | CodeExecutionState
                  | undefined;

                console.log('Execution state after sync:', status);

                if (status) {
                  setData({
                    isRunning: status.isRunning || false,
                    output: status.output || '',
                    error: status.error,
                    timestamp: status.timestamp || Date.now(),
                  });
                }
              }
              break;

            case 'update':
              if (Array.isArray(message.data) && ydocRef.current) {
                // Apply the received update
                const update = new Uint8Array(message.data);
                Y.applyUpdate(ydocRef.current, update);
              }
              break;

            case 'execution_start':
              if (isExecutionData(message.data)) {
                const execData = message.data as {
                  output?: string;
                  error?: string;
                  timestamp: number;
                };
                setData((prev) => ({
                  ...prev,
                  isRunning: true,
                  output: '',
                  error: undefined,
                  timestamp: execData.timestamp,
                }));
              }
              break;

            case 'execution_complete':
              if (isExecutionData(message.data)) {
                const execData = message.data as {
                  output?: string;
                  error?: string;
                  timestamp: number;
                };
                setData((prev) => ({
                  ...prev,
                  isRunning: false,
                  timestamp: execData.timestamp,
                  ...(execData.output && { output: execData.output }),
                }));
              }
              break;

            case 'execution_error':
              if (isExecutionData(message.data)) {
                const execData = message.data as {
                  output?: string;
                  error?: string;
                  timestamp: number;
                };
                setData((prev) => ({
                  ...prev,
                  isRunning: false,
                  error: execData.error,
                  timestamp: execData.timestamp,
                }));
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing code execution message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Code execution WebSocket disconnected');

        // Update connection status if callback provided
        setExecutionStatus?.({
          isConnected: false,
          status: 'disconnected',
        });

        // Clean up Y.js document
        if (ydocRef.current) {
          ydocRef.current.destroy();
          ydocRef.current = null;
        }

        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('Code execution WebSocket error:', error);

        // Update connection status if callback provided
        setExecutionStatus?.({
          isConnected: false,
          status: 'disconnected',
          error: 'Connection error',
        });
      };
    } catch (error) {
      console.error('Error creating code execution WebSocket:', error);

      // Update connection status if callback provided
      setExecutionStatus?.({
        isConnected: false,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [currentRoomId, setExecutionStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

    // Update connection status if callback provided
    setExecutionStatus?.({
      isConnected: false,
      status: 'disconnected',
    });
  }, [setExecutionStatus]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    data,
    connect,
    disconnect,
  };
}
