import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { useCurrentRoomId } from '@/lib/params';
import { apiClient } from '@/query/client';
import { useMutation } from '@tanstack/react-query';
import { Guest } from '@/lib/guest';

// Types matching AI service
export interface User {
  id: string;
  name: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming: boolean;
  user: User | null; // null for system messages
}

export interface AIConfig {
  model: string;
}

const KEYS = {
  messagesKey: 'ai_chat_messages',
  configKey: 'ai_chat_config',
};

export function useAIChat() {
  const { provider, isReadOnly } = useRoomContext();
  const currentRoomId = useCurrentRoomId();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [config, setConfig] = useState<AIConfig>({
    model: 'gpt-4',
  });

  // Observe changes to the chat messages in the main doc
  useEffect(() => {
    const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);
    const aiConfig = provider.doc.getMap<string>(KEYS.configKey);

    const updateConfig = () => {
      const configData = aiConfig.toJSON() as AIConfig;
      setConfig(configData);
    };

    const updateMessages = () => {
      const messagesData = messagesArray.toArray();
      setMessages(messagesData);
    };

    // Set initial values
    updateConfig();
    updateMessages();

    // Observe changes
    messagesArray.observe(updateMessages);
    aiConfig.observe(updateConfig);

    return () => {
      messagesArray.unobserve(updateMessages);
      aiConfig.unobserve(updateConfig);
    };
  }, [provider, isReadOnly]);

  // Function to add the user message and the placeholder AI message to the Y.js document
  const addMessages = useCallback(
    (message: string, user: User) => {
      const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);

      const userMessage: ChatMessage & { user: User } = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message.trim(),
        timestamp: Date.now(),
        isStreaming: false,
        user: user,
      };

      const assistantMessage: ChatMessage & { user: null } = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Thinking...',
        timestamp: Date.now(),
        isStreaming: true,
        user: null,
      };

      messagesArray.push([userMessage, assistantMessage]);

      return { userMessage, assistantMessage };
    },
    [provider, isReadOnly]
  );

  // Function to update AI config
  const updateConfig = useCallback(
    (newConfig: Partial<AIConfig>) => {
      const aiConfig = provider.doc.getMap('aiConfig');

      provider.doc.transact(() => {
        Object.entries(newConfig).forEach(([key, value]) => {
          aiConfig.set(key, value);
        });
      });
    },
    [provider, isReadOnly]
  );

  // Function to start a new chat conversation
  const startNewChat = useCallback(() => {
    const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);

    provider.doc.transact(() => {
      messagesArray.delete(0, messagesArray.length);
    });
  }, [provider, isReadOnly]);

  const sendChatMessage = useCallback(
    async (message: string, user: User) => {
      const { userMessage, assistantMessage } = addMessages(message, user);

      await apiClient.rooms[':roomId'].public.chat.$post({
        param: {
          roomId: currentRoomId,
        },
        json: {
          userMessage,
          assistantMessage,
        },
      });
    },
    [addMessages]
  );

  return {
    // State
    messages,
    config,
    isReadOnly,

    // Actions
    sendChatMessage,
    updateConfig,
    startNewChat,
  };
}
