import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { useCurrentRoomId } from '@/lib/params';
import { apiClient } from '@/query/client';
import { useMutation } from '@tanstack/react-query';

// Types from AI service
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

export interface StreamingState {
	isStreaming: boolean;
	streamingId?: string;
	userMessageId?: string;
	userId?: string;
}

export function useChatMessages() {
	const { provider, isReadOnly } = useRoomContext();
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	// Observe changes to the chat messages in the main doc
	useEffect(() => {
		if (!provider || isReadOnly) return;

		const chatMessages = provider.doc.getArray<ChatMessage>('chatMessages');

		const updateMessages = () => {
			const messagesArray = chatMessages.toArray();
			setMessages(messagesArray);
		};

		// Set initial messages
		updateMessages();

		// Observe changes
		chatMessages.observe(updateMessages);

		return () => {
			chatMessages.unobserve(updateMessages);
		};
	}, [provider, isReadOnly]);

	return messages;
}

export function useAIConfig() {
	const { provider, isReadOnly } = useRoomContext();
	const [config, setConfig] = useState<AIConfig>({
		model: 'gpt-4',
		temperature: 0.7,
		maxTokens: 1000,
		systemPrompt:
			"You are a helpful coding assistant. You are given a coding problem and a user's code. You need to help the user fix their code. You need to be very specific and to the point.",
	});

	// Observe changes to the AI config in the main doc
	useEffect(() => {
		if (!provider || isReadOnly) return;

		const aiConfig = provider.doc.getMap('aiConfig');

		const updateConfig = () => {
			const configData = aiConfig.toJSON() as AIConfig;
			setConfig(configData);
		};

		// Set initial config
		updateConfig();

		// Observe changes
		aiConfig.observe(updateConfig);

		return () => {
			aiConfig.unobserve(updateConfig);
		};
	}, [provider, isReadOnly]);

	return config;
}

export function useStreamingState() {
	const { provider, isReadOnly } = useRoomContext();
	const [streamingState, setStreamingState] = useState<StreamingState>({
		isStreaming: false,
	});

	// Observe changes to the streaming state in the main doc
	useEffect(() => {
		if (!provider || isReadOnly) return;

		const streamingStateMap = provider.doc.getMap('streamingState');

		const updateStreamingState = () => {
			const stateData = streamingStateMap.toJSON() as StreamingState;
			setStreamingState(stateData);
		};

		// Set initial state
		updateStreamingState();

		// Observe changes
		streamingStateMap.observe(updateStreamingState);

		return () => {
			streamingStateMap.unobserve(updateStreamingState);
		};
	}, [provider, isReadOnly]);

	return streamingState;
}

export const useSendChatMessage = () => {
	const currentRoomId = useCurrentRoomId();

	const mutation = useMutation({
		mutationFn: async (params: {
			message: string;
			user: { id: string; name: string; color: string };
		}) => {
			const response = await apiClient.rooms[':roomId'].public.chat.$post({
				param: { roomId: currentRoomId },
				json: params,
			});

			return response.json();
		},
	});

	return {
		sendChatMessage: mutation.mutateAsync,
		isLoading: mutation.isPending,
		...mutation,
	};
};
