import { useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  RiBold,
  RiCodeLine,
  RiItalic,
  RiStrikethrough,
  RiDoubleQuotesL,
  RiListOrdered,
  RiListUnordered,
} from '@remixicon/react';
import {
  useInstructionEditorCollaboration,
  defaultConfigs,
} from '@/query/realtime.query';

interface InstructionEditorProps {
  roomId: string;
  baseUrl?: string;
}

export const InstructionEditor = ({
  roomId,
  baseUrl,
}: InstructionEditorProps) => {
  // Use the new realtime collaboration hook
  const { editor, connectionStatus } = useInstructionEditorCollaboration({
    roomId,
    baseUrl: baseUrl || defaultConfigs.instructions.baseUrl,
    documentType: 'instructions',
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleStrike = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  const toggleCode = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor?.chain().focus().toggleBlockquote().run();
  };

  return (
    <div className='w-full h-full flex flex-col bg-white'>
      <div className='border-b border-gray-200 p-2 flex justify-between items-center flex-wrap gap-1 z-10'>
        <div className='flex flex-wrap gap-1'>
          <Button variant='icon' onClick={toggleBold}>
            <RiBold className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleItalic}>
            <RiItalic className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleStrike}>
            <RiStrikethrough className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleCode}>
            <RiCodeLine className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleBlockquote}>
            <RiDoubleQuotesL className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleOrderedList}>
            <RiListOrdered className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleBulletList}>
            <RiListUnordered className='size-4' />
          </Button>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          {/* Connection Status */}
          <div className='flex items-center gap-1'>
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span
              className={
                connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
              }
            >
              {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {connectionStatus.error && (
              <span className='text-red-600 text-xs'>
                {connectionStatus.error}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className='flex-1 min-h-0 overflow-auto'
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className='px-2 py-4 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </div>
    </div>
  );
};
