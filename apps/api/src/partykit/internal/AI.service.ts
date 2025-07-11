import { AppContext } from '@/index';
import { OpenAI } from 'openai';
import * as Y from 'yjs';
import { Id } from '@coderscreen/common/id';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	userId?: string;
	userName?: string;
	isStreaming?: boolean;
	streamingId?: string;
}

export interface AIConfig {
	model: string;
	temperature?: number;
	maxTokens?: number;
	systemPrompt?: string;
}

export class AIService {
	private env: AppContext['Bindings'];
	private document: Y.Doc;
	private client: OpenAI;

	static SYSTEM_PROMPT = `You are a helpful coding assistant. You are given a coding problem and a user's code. You need to help the user fix their code. You need to be very specific and to the point.`;

	constructor(env: AppContext['Bindings'], document: Y.Doc) {
		this.env = env;
		this.document = document;

		this.client = new OpenAI({
			apiKey: this.env.OPENROUTER_API_KEY,
			baseURL: 'https://openrouter.ai/api/v1',
		});
	}

	/**
	 * Initialize AI chat structures in the Y.js document
	 */
	initializeChat() {
		// Get or create chat messages array
		if (!this.document.getArray('chatMessages')) {
			this.document.getArray('chatMessages');
		}

		// Get or create AI configuration
		if (!this.document.getMap('aiConfig')) {
			const aiConfig = this.document.getMap('aiConfig');
			aiConfig.set('model', 'gpt-4');
			aiConfig.set('temperature', 0.7);
			aiConfig.set('maxTokens', 1000);
			aiConfig.set('systemPrompt', AIService.SYSTEM_PROMPT);
		}

		// Get or create streaming state
		if (!this.document.getMap('streamingState')) {
			this.document.getMap('streamingState');
		}
	}

	/**
	 * Add a user message to the chat
	 */
	addUserMessage(content: string, userId?: string, userName?: string): string {
		const chatMessages = this.document.getArray('chatMessages');
		const messageId = crypto.randomUUID();
		
		const message: ChatMessage = {
			id: messageId,
			role: 'user',
			content,
			timestamp: Date.now(),
			userId,
			userName,
		};

		this.document.transact(() => {
			chatMessages.push([message]);
		});

		return messageId;
	}

	/**
	 * Add an assistant message to the chat
	 */
	addAssistantMessage(content: string, messageId?: string): string {
		const chatMessages = this.document.getArray('chatMessages');
		const id = messageId || crypto.randomUUID();
		
		const message: ChatMessage = {
			id: id,
			role: 'assistant',
			content,
			timestamp: Date.now(),
		};

		this.document.transact(() => {
			chatMessages.push([message]);
		});

		return id;
	}

	/**
	 * Start streaming an AI response
	 */
	async startStreamingResponse(userMessageId: string, userId?: string): Promise<string> {
		const streamingId = crypto.randomUUID();
		const streamingState = this.document.getMap('streamingState');
		
		// Set streaming state
		this.document.transact(() => {
			streamingState.set('isStreaming', true);
			streamingState.set('streamingId', streamingId);
			streamingState.set('userMessageId', userMessageId);
			streamingState.set('userId', userId);
		});

		// Add initial assistant message
		const messageId = this.addAssistantMessage('', streamingId);
		
		// Start the streaming process
		this.streamAIResponse(streamingId, userMessageId);
		
		return streamingId;
	}

	/**
	 * Stream AI response content using OpenAI client
	 */
	private async streamAIResponse(streamingId: string, userMessageId: string) {
		try {
			const chatMessages = this.document.getArray('chatMessages');
			const aiConfig = this.document.getMap('aiConfig');
			
			// Get conversation history
			const messages = chatMessages.toArray() as ChatMessage[];
			const conversationHistory = messages.map(msg => ({
				role: msg.role,
				content: msg.content,
			}));

			// Get AI configuration
			const model = aiConfig.get('model') as string || 'gpt-4';
			const temperature = aiConfig.get('temperature') as number || 0.7;
			const maxTokens = aiConfig.get('maxTokens') as number || 1000;
			const systemPrompt = aiConfig.get('systemPrompt') as string || AIService.SYSTEM_PROMPT;

			// Prepare the request to OpenAI
			const requestBody = {
				model,
				messages: [
					{ role: 'system' as const, content: systemPrompt },
					...conversationHistory.map(msg => ({
						role: msg.role as 'user' | 'assistant' | 'system',
						content: msg.content,
					}))
				],
				temperature,
				max_tokens: maxTokens,
				stream: true as const,
			};

			// Make streaming request to OpenAI
			const stream = await this.client.chat.completions.create(requestBody);
			
			let accumulatedContent = '';

			for await (const chunk of stream) {
				const content = chunk.choices[0]?.delta?.content;
				if (content) {
					accumulatedContent += content;
					this.updateStreamingMessage(streamingId, accumulatedContent);
				}
			}

			// Complete streaming
			this.onComplete(streamingId, accumulatedContent);

		} catch (error) {
			console.error('Error streaming AI response:', error);
			this.handleStreamingError(streamingId, error as Error);
		}
	}

	/**
	 * Update streaming message content
	 */
	private updateStreamingMessage(streamingId: string, content: string) {
		const chatMessages = this.document.getArray('chatMessages');
		const messages = chatMessages.toArray() as ChatMessage[];
		
		// Find the streaming message
		const streamingMessageIndex = messages.findIndex(msg => msg.streamingId === streamingId);
		
		if (streamingMessageIndex !== -1) {
			this.document.transact(() => {
				const message = messages[streamingMessageIndex];
				message.content = content;
				message.isStreaming = true;
				
				// Update the message in the array
				chatMessages.delete(streamingMessageIndex, 1);
				chatMessages.insert(streamingMessageIndex, [message]);
			});
		}
	}

	/**
	 * Complete streaming and finalize the message
	 */
	private onComplete(streamingId: string, finalContent: string) {
		const streamingState = this.document.getMap('streamingState');
		const chatMessages = this.document.getArray('chatMessages');
		const messages = chatMessages.toArray() as ChatMessage[];
		
		// Find and update the streaming message
		const streamingMessageIndex = messages.findIndex(msg => msg.streamingId === streamingId);
		
		if (streamingMessageIndex !== -1) {
			this.document.transact(() => {
				const message = messages[streamingMessageIndex];
				message.content = finalContent;
				message.isStreaming = false;
				
				// Update the message in the array
				chatMessages.delete(streamingMessageIndex, 1);
				chatMessages.insert(streamingMessageIndex, [message]);
				
				// Clear streaming state
				streamingState.set('isStreaming', false);
				streamingState.set('streamingId', null);
				streamingState.set('userMessageId', null);
				streamingState.set('userId', null);
			});
		}
	}

	/**
	 * Handle streaming errors
	 */
	private handleStreamingError(streamingId: string, error: Error) {
		const streamingState = this.document.getMap('streamingState');
		const chatMessages = this.document.getArray('chatMessages');
		const messages = chatMessages.toArray() as ChatMessage[];
		
		// Find and update the streaming message with error
		const streamingMessageIndex = messages.findIndex(msg => msg.streamingId === streamingId);
		
		if (streamingMessageIndex !== -1) {
			this.document.transact(() => {
				const message = messages[streamingMessageIndex];
				message.content = `Error: ${error.message}`;
				message.isStreaming = false;
				
				// Update the message in the array
				chatMessages.delete(streamingMessageIndex, 1);
				chatMessages.insert(streamingMessageIndex, [message]);
				
				// Clear streaming state
				streamingState.set('isStreaming', false);
				streamingState.set('streamingId', null);
				streamingState.set('userMessageId', null);
				streamingState.set('userId', null);
			});
		}
	}

	/**
	 * Get all chat messages
	 */
	getChatMessages(): ChatMessage[] {
		const chatMessages = this.document.getArray('chatMessages');
		return chatMessages.toArray() as ChatMessage[];
	}

	/**
	 * Get AI configuration
	 */
	getAIConfig(): AIConfig {
		const aiConfig = this.document.getMap('aiConfig');
		return {
			model: aiConfig.get('model') as string,
			temperature: aiConfig.get('temperature') as number,
			maxTokens: aiConfig.get('maxTokens') as number,
			systemPrompt: aiConfig.get('systemPrompt') as string,
		};
	}

	/**
	 * Update AI configuration
	 */
	updateAIConfig(config: Partial<AIConfig>) {
		const aiConfig = this.document.getMap('aiConfig');
		
		this.document.transact(() => {
			if (config.model) aiConfig.set('model', config.model);
			if (config.temperature !== undefined) aiConfig.set('temperature', config.temperature);
			if (config.maxTokens !== undefined) aiConfig.set('maxTokens', config.maxTokens);
			if (config.systemPrompt) aiConfig.set('systemPrompt', config.systemPrompt);
		});
	}

	/**
	 * Check if currently streaming
	 */
	isStreaming(): boolean {
		const streamingState = this.document.getMap('streamingState');
		return streamingState.get('isStreaming') as boolean || false;
	}

	/**
	 * Get current streaming information
	 */
	getStreamingInfo(): { streamingId: string; userMessageId: string; userId?: string } | null {
		const streamingState = this.document.getMap('streamingState');
		const isStreaming = streamingState.get('isStreaming') as boolean;
		
		if (!isStreaming) return null;
		
		return {
			streamingId: streamingState.get('streamingId') as string,
			userMessageId: streamingState.get('userMessageId') as string,
			userId: streamingState.get('userId') as string,
		};
	}

	/**
	 * Delete a specific message
	 */
	deleteMessage(messageId: string): boolean {
		const chatMessages = this.document.getArray('chatMessages');
		const messages = chatMessages.toArray() as ChatMessage[];
		
		const messageIndex = messages.findIndex(msg => msg.id === messageId);
		
		if (messageIndex !== -1) {
			this.document.transact(() => {
				chatMessages.delete(messageIndex, 1);
			});
			return true;
		}
		
		return false;
	}

	/**
	 * Edit a message
	 */
	editMessage(messageId: string, newContent: string): boolean {
		const chatMessages = this.document.getArray('chatMessages');
		const messages = chatMessages.toArray() as ChatMessage[];
		
		const messageIndex = messages.findIndex(msg => msg.id === messageId);
		
		if (messageIndex !== -1) {
			this.document.transact(() => {
				const message = messages[messageIndex];
				message.content = newContent;
				message.timestamp = Date.now();
				
				// Update the message in the array
				chatMessages.delete(messageIndex, 1);
				chatMessages.insert(messageIndex, [message]);
			});
			return true;
		}
		
		return false;
	}
}
