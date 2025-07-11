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

  const { messages, config, isReadOnly, sendChatMessage, updateConfig, startNewChat } = useAIChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleNewChat = () => {
    startNewChat();
  };

  return (
    <div className='h-full flex flex-col bg-white'>
      <div className='border-b border-slate-200 px-4 py-3 bg-slate-50 flex items-center justify-between'>
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
            {messages.length === 0 ? (
              <div className='text-center text-slate-500 py-8'>
                <RiRobotFill className='h-12 w-12 mx-auto mb-4 text-slate-300' />
                <p className='text-slate-600'>Start a conversation with the AI assistant</p>
                <p className='text-sm text-slate-500'>
                  Ask for help with your code or programming questions
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'flex gap-3 max-w-[80%]',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className='flex-shrink-0'>
                      {message.role === 'assistant' ? (
                        <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                          <RiRobotFill className='h-4 w-4 text-white' />
                        </div>
                      ) : message.user ? (
                        <div key={message.id} className='flex items-center gap-1'>
                          <div
                            className='w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-background transition-transform cursor-pointer'
                            style={{ backgroundColor: message.user.color }}
                          >
                            {message.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className='text-xs text-muted-foreground max-w-16 truncate'>
                            {message.user.name}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div
                      className={cn(
                        'rounded-lg px-4 py-2',
                        message.role === 'user'
                          ? 'bg-blue-50 border border-blue-200 text-blue-900'
                          : 'bg-slate-50 border border-slate-200'
                      )}
                    >
                      <div className='whitespace-pre-wra text-sm'>{message.content}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className='border-t border-slate-200 p-4 bg-slate-50'>
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
