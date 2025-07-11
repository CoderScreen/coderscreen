import { AppContext } from '@/index';
import { generateId } from '@coderscreen/common/id';
import { LLMMessageEntity, llmMessageTable } from '@coderscreen/db/llmMessage.db';
import { RoomEntity } from '@coderscreen/db/room.db';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { OpenAI } from 'openai';
import postgres from 'postgres';
import * as Y from 'yjs';

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

export interface StreamingState {
  isStreaming: boolean;
}

export class AIService {
  private env: AppContext['Bindings'];
  private document: Y.Doc;
  private client: OpenAI;
  private db: PostgresJsDatabase | null = null;
  private room: RoomEntity;

  static SYSTEM_PROMPT = `You are a helpful coding assistant. You are given a coding problem and a user's code. You need to help the user fix their code. You need to be very specific and to the point.`;
  static TEMPERATURE = 0.7;
  static MAX_TOKENS = 1000;

  static messagesKey = 'ai_chat_messages';
  static configKey = 'ai_chat_config';

  constructor(env: AppContext['Bindings'], document: Y.Doc, room: RoomEntity) {
    this.env = env;
    this.document = document;
    this.room = room;

    this.client = new OpenAI({
      apiKey: this.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  /**
   * Initialize AI chat structures in the Y.js document
   */
  initializeChat() {
    // Initialize messages array if it doesn't exist
    if (!this.document.getArray(AIService.messagesKey)) {
      this.document.getArray(AIService.messagesKey);
    }
    if (!this.document.getMap('aiConfig')) {
      this.document.getMap('aiConfig');
    }
    if (!this.document.getMap('streamingState')) {
      this.document.getMap('streamingState');
    }
  }

  /**
   * Get the messages array
   */
  private getMessagesArray(): Y.Array<ChatMessage> {
    return this.document.getArray(AIService.messagesKey);
  }

  /**
   * Stream AI response content using OpenAI client
   */
  async streamResponse(params: {
    userMessage: ChatMessage & { user: User };
    assistantMessage: ChatMessage;
  }) {
    const { userMessage, assistantMessage } = params;

    const baseResponseMsg = assistantMessage;
    const result: ChatMessage[] = [userMessage];

    try {
      const messagesArray = this.getMessagesArray();
      const aiConfig = this.document.getMap('aiConfig');

      // Get conversation history
      const conversationHistory = messagesArray.toArray().map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI configuration
      const model = (aiConfig.get('model') as string) || 'gpt-4';

      // Prepare the request to OpenAI
      const requestBody = {
        model,
        messages: [
          { role: 'system' as const, content: AIService.SYSTEM_PROMPT },
          ...conversationHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          })),
        ],
        temperature: AIService.TEMPERATURE,
        max_tokens: AIService.MAX_TOKENS,
        stream: true as const,
      };

      // Make streaming request to OpenAI
      const stream = await this.client.chat.completions.create(requestBody);

      let accumulatedContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          accumulatedContent += content;
          this.updateStreamingMessage(baseResponseMsg.id, accumulatedContent);
        }
      }
    } catch (error) {
      console.error('Error streaming AI response:', error);
      this.handleStreamingError(baseResponseMsg.id, error as Error);
    }

    return result;
  }

  /**
   * Update streaming message content
   */
  private updateStreamingMessage(streamingId: string, content: string) {
    const messagesArray = this.getMessagesArray();
    const messages = messagesArray.toArray();

    // Find the streaming message
    const streamingMessageIndex = messages.findIndex((msg) => msg.id === streamingId);

    if (streamingMessageIndex !== -1) {
      this.document.transact(() => {
        const message = messages[streamingMessageIndex];
        message.content = content;
        message.isStreaming = true;

        // Update the message in the array
        messagesArray.delete(streamingMessageIndex, 1);
        messagesArray.insert(streamingMessageIndex, [message]);
      });
    }
  }

  /**
   * Complete streaming and finalize the message
   */
  async onComplete(messages: ChatMessage[]) {
    const db = this.getDb();

    const toInsert: LLMMessageEntity[] = messages.map((message) => ({
      id: generateId('llmMessage'),
      createdAt: new Date().toISOString(),
      organizationId: this.room.organizationId,
      role: message.role,
      content: message.content,
      roomId: this.room.id,
      conversationId: '',
      metadata: {
        model: this.getConfig().model,
      },
    }));

    await db.insert(llmMessageTable).values(toInsert);
  }

  /**
   * Handle streaming errors
   */
  private handleStreamingError(streamingId: string, error: Error) {
    const streamingState = this.document.getMap('streamingState');
    const messagesArray = this.getMessagesArray();
    const messages = messagesArray.toArray();

    // Find and update the streaming message with error
    const streamingMessageIndex = messages.findIndex((msg) => msg.id === streamingId);

    if (streamingMessageIndex !== -1) {
      this.document.transact(() => {
        const message = messages[streamingMessageIndex];
        message.content = `Error: ${error.message}`;
        message.isStreaming = false;

        // Update the message in the array
        messagesArray.delete(streamingMessageIndex, 1);
        messagesArray.insert(streamingMessageIndex, [message]);

        // Clear streaming state
        streamingState.set('isStreaming', false);
      });
    }
  }

  /**
   * Add a new message to the chat
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const messagesArray = this.getMessagesArray();
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    this.document.transact(() => {
      messagesArray.push([newMessage]);
    });

    return newMessage;
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    const messagesArray = this.getMessagesArray();
    return messagesArray.toArray();
  }

  /**
   * Clear all messages (start new chat)
   */
  clearMessages() {
    const messagesArray = this.getMessagesArray();

    this.document.transact(() => {
      messagesArray.delete(0, messagesArray.length);
    });
  }

  /**
   * Update AI configuration
   */
  updateConfig(config: Partial<AIConfig>) {
    const aiConfig = this.document.getMap('aiConfig');

    this.document.transact(() => {
      Object.entries(config).forEach(([key, value]) => {
        aiConfig.set(key, value);
      });
    });
  }

  /**
   * Get current AI configuration
   */
  getConfig(): AIConfig {
    const aiConfig = this.document.getMap('aiConfig');
    return {
      model: (aiConfig.get('model') as string) || 'gpt-4',
    };
  }

  private getDb() {
    if (!this.db) {
      const sql = postgres(this.env.DATABASE_URL);
      this.db = drizzle(sql);
    }

    return this.db;
  }
}
