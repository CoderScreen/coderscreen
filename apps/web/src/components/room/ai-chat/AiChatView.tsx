import { SupportedModels } from '@coderscreen/api/schema/ai';
import { Button } from '@coderscreen/ui/button';
import { Input } from '@coderscreen/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { Tooltip } from '@coderscreen/ui/tooltip';
import {
  RemixiconComponentType,
  RiAddLine,
  RiAiGenerate2,
  RiClaudeLine,
  RiGoogleLine,
  RiOpenaiFill,
  RiRobotFill,
  RiSendPlaneFill,
} from '@remixicon/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Markdown } from '@/components/room/ai-chat/Markdown';
import { getGuest } from '@/lib/guest';
import { cn } from '@/lib/utils';
import { useSession } from '@/query/auth.query';
import { ChatMessage, User, useAIChat } from '@/query/realtime/chat.query';
import { getRandomColor } from '@/query/realtime/utils';

interface AiChatViewProps {
  role: 'host' | 'guest';
}

const MODEL_OPTIONS: {
  label: string;
  value: SupportedModels;
  icon: RemixiconComponentType;
}[] = [
  { label: 'Claude Haiku 5.5', value: 'anthropic/claude-haiku-5.5', icon: RiClaudeLine },
  { label: 'Claude Sonnet 5.5', value: 'anthropic/claude-sonnet-5.5', icon: RiClaudeLine },
  { label: 'GPT-6 Luna', value: 'openai/gpt-6-luna', icon: RiOpenaiFill },
  { label: 'GPT-6.2 Sol', value: 'openai/gpt-6.2-sol', icon: RiOpenaiFill },
  { label: 'Gemini 3.8 Flash', value: 'google/gemini-3.8-flash', icon: RiGoogleLine },
  { label: 'Gemini 4 Hydrogen', value: 'google/gemini-4-hydrogen', icon: RiGoogleLine },
  { label: 'DeepSeek V4 Flash', value: 'deepseek/deepseek-v4-flash-0731', icon: RiAiGenerate2 },
  { label: 'DeepSeek V4.1 Flash', value: 'deepseek/deepseek-v4.1-flash', icon: RiAiGenerate2 },
  { label: 'DeepSeek V4 Pro', value: 'deepseek/deepseek-v4-pro-0813', icon: RiAiGenerate2 },
  { label: 'Kimi K3.1 Pro', value: 'moonshotai/kimi-k3.1-pro', icon: RiAiGenerate2 },
  { label: 'Kimi K2.7 Code', value: 'moonshotai/kimi-k2.7-code', icon: RiAiGenerate2 },
];

const DEFAULT_MODEL: SupportedModels = 'deepseek/deepseek-v4-flash-0731';

export const AiChatView = ({ role }: AiChatViewProps) => {
  const { user } = useSession();
  const guest = getGuest();

  const userInfo = useMemo((): User => {
    if (role === 'host' && user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        color: getRandomColor(user.id),
      };
    }

    return (
      guest ?? {
        id: `anonymous-${Math.random().toString(36).substring(2, 15)}`,
        name: 'Anonymous',
        email: '',
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
  } = useAIChat();

  // Auto-scroll to bottom on component load
  useEffect(() => {
    if (!hasScrolledRef.current && (pastConversations.length > 0 || messages.length > 0)) {
      messagesEndRef.current?.scrollIntoView();
      hasScrolledRef.current = true;
    }
  }, [messages, pastConversations]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isReadOnly) return;

    try {
      const value = inputValue.trim();
      setInputValue('');
      await sendChatMessage(value, userInfo);

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const selectedModel = MODEL_OPTIONS.some((option) => option.value === config.model)
    ? config.model
    : DEFAULT_MODEL;

  const handleModelChange = (value: SupportedModels) => {
    updateConfig({ model: value });
  };

  const handleNewChat = async () => {
    try {
      await startNewChat();
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const renderMessage = (message: ChatMessage) => (
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
            'rounded-lg px-4 py-2 w-full',
            message.role === 'user' ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border',
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
      <div className='border-b py-1 px-2 flex items-center justify-between'>
        <Select value={selectedModel} onValueChange={handleModelChange} disabled={isReadOnly}>
          <SelectTrigger className='w-fit'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className='flex items-center gap-1 pr-4'>
                  <option.icon className='w-4 h-4 shrink-0' />
                  <span className='truncate'>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant='ghost' icon={RiAddLine} onClick={handleNewChat} disabled={isReadOnly}>
          New Chat
        </Button>
      </div>
      <div className='flex-1 flex flex-col overflow-y-auto px-2'>
        <div className='flex-1 p-4'>
          <div className='space-y-4'>
            {pastConversations.length > 0 ? (
              <>
                {/* Past Conversations */}
                {pastConversations.map((conversation, conversationIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: needed for list
                  <div key={conversationIndex}>
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
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>Start a conversation with the AI assistant</p>
                <p className='text-sm text-muted-foreground'>
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
      <div className='border-t p-2'>
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
