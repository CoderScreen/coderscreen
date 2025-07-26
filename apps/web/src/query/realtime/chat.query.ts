import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { useCurrentRoomId } from '@/lib/params';
import { apiClient } from '@/query/client';
import { SupportedModels } from '@coderscreen/api/schema/ai';
import { Guest } from '@/lib/guest';

// Types matching AI service
export type User = Guest;

export interface ChatMessage {
  id: string;
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming: boolean;
  user: User | null; // null for system messages
  success: boolean;
  conversationId: string;
}

export interface AIConfig {
  model: SupportedModels;
}

const KEYS = {
  messagesKey: 'ai_chat_messages',
  pastConversationsKey: 'ai_chat_past_conversations',
  conversationIdKey: 'ai_chat_conversation_id',
  configKey: 'ai_chat_config',
  config: {
    model: 'model',
  },
};

export function useAIChat() {
  const { provider, isReadOnly } = useRoomContext();
  const currentRoomId = useCurrentRoomId();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [config, setConfig] = useState<AIConfig>({
    model: 'openai/gpt-4.1-mini',
  });
  const [pastConversations, setPastConversations] = useState<ChatMessage[][]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');

  // Observe changes to the chat messages in the main doc
  useEffect(() => {
    const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);
    const aiConfig = provider.doc.getMap<string>(KEYS.configKey);
    const pastConversationsArray = provider.doc.getArray<ChatMessage[]>(KEYS.pastConversationsKey);
    const conversationIdValue = provider.doc.getText(KEYS.conversationIdKey);

    const updateConfig = () => {
      const configData = aiConfig.toJSON() as AIConfig;
      setConfig(configData);
    };

    const updateMessages = () => {
      const messagesData = messagesArray.toArray();
      setMessages(messagesData);
    };

    const updatePastConversations = () => {
      const pastConversationsData = pastConversationsArray.toArray();
      setPastConversations(pastConversationsData);
    };

    const updateConversationId = () => {
      const conversationId = conversationIdValue.toString();
      setCurrentConversationId(conversationId);
    };

    // Set initial values
    updateConfig();
    updateMessages();
    updatePastConversations();
    updateConversationId();

    // Observe changes
    messagesArray.observe(updateMessages);
    aiConfig.observe(updateConfig);
    pastConversationsArray.observe(updatePastConversations);
    conversationIdValue.observe(updateConversationId);

    return () => {
      messagesArray.unobserve(updateMessages);
      aiConfig.unobserve(updateConfig);
      pastConversationsArray.unobserve(updatePastConversations);
      conversationIdValue.unobserve(updateConversationId);
    };
  }, [provider, isReadOnly]);

  // Function to add the user message and the placeholder AI message to the Y.js document
  const addMessages = (message: string, user: User) => {
    const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);

    const userMessage: ChatMessage & { user: User; success: true } = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
      isStreaming: false,
      user: user,
      success: true,
      conversationId: currentConversationId,
    };

    const assistantMessage: ChatMessage & { user: null; success: true } = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: Date.now(),
      isStreaming: true,
      user: null,
      success: true,
      conversationId: currentConversationId,
    };

    messagesArray.push([userMessage, assistantMessage]);

    return { userMessage, assistantMessage };
  };

  // Function to update AI config
  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const aiConfig = provider.doc.getMap(KEYS.configKey);
    provider.doc.transact(() => {
      Object.entries(newConfig).forEach(([key, value]) => {
        aiConfig.set(key, value);
      });
    });
  };

  // Function to start a new chat conversation
  const startNewChat = async () => {
    const messagesArray = provider.doc.getArray<ChatMessage>(KEYS.messagesKey);
    const pastConversationsArray = provider.doc.getArray<ChatMessage[]>(KEYS.pastConversationsKey);
    const conversationIdValue = provider.doc.getText(KEYS.conversationIdKey);

    provider.doc.transact(() => {
      // Save current conversation to past conversations if there are messages
      const currentMessages = messagesArray.toArray();
      if (currentMessages.length > 0) {
        pastConversationsArray.push([currentMessages]);
      }

      // Clear current messages
      messagesArray.delete(0, messagesArray.length);

      // Generate new conversation ID
      const newConversationId = crypto.randomUUID();
      conversationIdValue.delete(0, conversationIdValue.length);
      conversationIdValue.insert(0, newConversationId);
    });
  };

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
    pastConversations,
    currentConversationId,

    // Actions
    sendChatMessage,
    updateConfig,
    startNewChat,
  };
}
