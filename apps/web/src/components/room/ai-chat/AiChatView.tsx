import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAIChat, User } from '@/query/realtime/chat.query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RiSendPlaneFill, RiRobotFill, RiAddLine } from '@remixicon/react';
import { getGuest } from '@/lib/guest';
import { useSession } from '@/query/auth.query';
import { getRandomColor } from '@/query/realtime/utils';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Markdown } from '@/components/room/ai-chat/Markdown';

interface AiChatViewProps {
  role: 'host' | 'guest';
}

export const AiChatView = ({ role }: AiChatViewProps) => {
  const { user } = useSession();
  const guest = getGuest();

  const userInfo = useMemo((): User => {
    if (role === 'host' && user) {
      return {
        id: user.id,
        name: user.name,
        color: getRandomColor(user.id),
      };
    }

    return (
      guest ?? {
        id: `anonymous-${Math.random().toString(36).substring(2, 15)}`,
        name: 'Anonymous',
        color: getRandomColor(),
      }
    );
  }, [role, user, guest]);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const {
    messages,
    pastConversations,
    config,
    isReadOnly,
    sendChatMessage,
    updateConfig,
    startNewChat,
    currentConversationId,
  } = useAIChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!hasScrolledRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView();
      hasScrolledRef.current = true;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isReadOnly) return;

    try {
      const value = inputValue.trim();
      setInputValue('');
      await sendChatMessage(value, userInfo);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModelChange = (value: string) => {
    updateConfig({ model: value });
  };

  const handleNewChat = async () => {
    try {
      await startNewChat();
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const renderMessage = (message: any) => (
    <div
      key={message.id}
      className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex gap-3 max-w-[80%]',
          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div className='flex-shrink-0'>
          {message.role === 'assistant' ? (
            <div className='w-7 h-7 rounded-lg bg-primary flex items-center justify-center'>
              <RiRobotFill className='h-4 w-4 text-white' />
            </div>
          ) : message.user ? (
            <div key={message.id} className='flex items-center gap-1'>
              <Tooltip content={message.user.name}>
                <div
                  className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-background transition-transform cursor-pointer'
                  style={{ backgroundColor: message.user.color }}
                >
                  {message.user.name.charAt(0).toUpperCase()}
                </div>
              </Tooltip>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'rounded-lg px-4 py-2',
            message.role === 'user'
              ? 'bg-blue-50 border border-blue-200 text-blue-900'
              : 'bg-slate-50 border',
            message.success ? '' : 'border-red-200 text-red-900 bg-red-50'
          )}
        >
          <div className='text-sm'>
            <Markdown message={message} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='h-full flex flex-col bg-white'>
      <div className='border-b py-2 flex items-center justify-between'>
        <Select value={config.model} onValueChange={handleModelChange}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='gpt-4'>GPT-4</SelectItem>
            <SelectItem value='gpt-3.5-turbo'>GPT-3.5</SelectItem>
            <SelectItem value='claude-3'>Claude 3</SelectItem>
          </SelectContent>
        </Select>
        <Button variant='ghost' icon={RiAddLine} onClick={handleNewChat}>
          New Chat
        </Button>
      </div>
      <div className='flex-1 flex flex-col overflow-y-auto'>
        <div className='flex-1 p-4'>
          <div className='space-y-4'>
            {role === 'host' && pastConversations.length > 0 ? (
              <>
                {/* Past Conversations */}
                {pastConversations.map((conversation, conversationIndex) => (
                  <div key={`past-conversation-${conversationIndex}`}>
                    {conversation.map((message) => renderMessage(message))}
                    <div className='my-6 border-t border-slate-200 relative'>
                      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-500 font-medium'>
                        Start of new chat
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {/* Current Messages */}
            {messages.length === 0 ? (
              <div className='text-center text-slate-500 py-8'>
                <RiRobotFill className='h-12 w-12 mx-auto mb-4 text-slate-300' />
                <p className='text-slate-600'>Start a conversation with the AI assistant</p>
                <p className='text-sm text-slate-500'>
                  Ask for help with your code or programming questions
                </p>
              </div>
            ) : (
              messages.map((message) => renderMessage(message))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className='border-t pt-4 pb-2'>
        <div className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Ask the AI assistant...'
            disabled={isReadOnly}
            className='flex-1'
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isReadOnly}
            icon={RiSendPlaneFill}
          >
            Send
          </Button>
        </div>
        {isReadOnly && (
          <p className='text-xs text-slate-500 mt-2'>Read-only mode - you cannot send messages</p>
        )}
      </div>
    </div>
  );
};
