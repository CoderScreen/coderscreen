import React, { useState, useRef, useEffect } from 'react';
import {
	useChatMessages,
	useAIConfig,
	useStreamingState,
	useSendChatMessage,
	ChatMessage,
} from '@/query/realtime/chat.query';
import { useRoomContext } from '@/contexts/RoomContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { RiSendPlaneFill, RiRobotFill, RiUserFill, RiLoader2Fill } from '@remixicon/react';

export const AiChatView = () => {
	const [inputValue, setInputValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { provider, isReadOnly } = useRoomContext();
	const messages = useChatMessages();
	const aiConfig = useAIConfig();
	const streamingState = useStreamingState();
	const { sendChatMessage, isLoading } = useSendChatMessage();

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputValue.trim() || isSubmitting || isReadOnly) return;

		setIsSubmitting(true);
		try {
			// Add user message to the Y.js document
			const chatMessages = provider.doc.getArray<ChatMessage>('chatMessages');
			const messageId = crypto.randomUUID();

			const userMessage: ChatMessage = {
				id: messageId,
				role: 'user',
				content: inputValue.trim(),
				timestamp: Date.now(),
				userId: 'current-user', // You might want to get this from auth context
				userName: 'You',
			};

			provider.doc.transact(() => {
				chatMessages.push([userMessage]);
			});

			// Send to AI service via API
			await sendChatMessage({
				message: inputValue.trim(),
				user: {
					id: 'current-user',
					name: 'You',
					color: '#3b82f6',
				},
			});

			setInputValue('');
		} catch (error) {
			console.error('Error sending message:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const isStreaming = streamingState.isStreaming;

	return (
		<div className="h-full flex flex-col">
			<div className="border-b px-4 py-3 bg-background">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<RiRobotFill className="h-5 w-5" />
						<span className="font-medium">AI Assistant</span>
						{isStreaming && (
							<Badge variant="neutral" className="ml-2">
								<RiLoader2Fill className="h-3 w-3 animate-spin mr-1" />
								Thinking...
							</Badge>
						)}
					</div>
					<Select
						value={aiConfig.model}
						onValueChange={(value) => console.log('Model changed:', value)}
					>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="gpt-4">GPT-4</SelectItem>
							<SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
							<SelectItem value="claude-3">Claude 3</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex-1 flex flex-col">
				<div className="flex-1 overflow-y-auto px-4">
					<div className="space-y-4 pb-4 pt-4">
						{messages.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								<RiRobotFill className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Start a conversation with the AI assistant</p>
								<p className="text-sm">Ask for help with your code or programming questions</p>
							</div>
						) : (
							messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-3 ${
										message.role === 'user' ? 'justify-end' : 'justify-start'
									}`}
								>
									<div
										className={`flex gap-3 max-w-[80%] ${
											message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
										}`}
									>
										<div className="flex-shrink-0">
											{message.role === 'user' ? (
												<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
													<RiUserFill className="h-4 w-4 text-white" />
												</div>
											) : (
												<div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
													<RiRobotFill className="h-4 w-4 text-white" />
												</div>
											)}
										</div>

										<div
											className={`rounded-lg px-4 py-2 ${
												message.role === 'user'
													? 'bg-blue-500 text-white'
													: 'bg-gray-100 dark:bg-gray-800'
											}`}
										>
											<div className="whitespace-pre-wrap">{message.content}</div>
											<div
												className={`text-xs mt-1 ${
													message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
												}`}
											>
												{formatTimestamp(message.timestamp)}
												{message.isStreaming && (
													<span className="ml-2">
														<RiLoader2Fill className="h-3 w-3 animate-spin inline" />
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
				</div>

				<div className="border-t p-4">
					<div className="flex gap-2">
						<Input
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Ask the AI assistant..."
							disabled={isReadOnly || isSubmitting}
							className="flex-1"
						/>
						<Button
							onClick={handleSendMessage}
							disabled={!inputValue.trim() || isReadOnly}
							icon={RiSendPlaneFill}
							isLoading={isLoading}
						>
							Send
						</Button>
					</div>
					{isReadOnly && (
						<p className="text-xs text-muted-foreground mt-2">
							Read-only mode - you cannot send messages
						</p>
					)}
				</div>
			</div>
		</div>
	);
};
