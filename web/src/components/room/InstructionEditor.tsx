import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Button } from '@/components/ui/button';
import {
  RiBold,
  RiCodeLine,
  RiItalic,
  RiStrikethrough,
  RiDoubleQuotesL,
  RiListOrdered,
  RiListUnordered,
  RiCheckLine,
} from '@remixicon/react';

interface InstructionEditorProps {
  roomId: string;
  websocketUrl?: string;
}

export const InstructionEditor = ({
  roomId,
  websocketUrl = 'ws://localhost:8000/room/instructions',
}: InstructionEditorProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [content, setContent] = useState('');
  const [isReady, setIsReady] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Set up Yjs document and provider
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Use the instruction-specific WebSocket endpoint
    const provider = new WebsocketProvider(websocketUrl, roomId, ydoc);
    providerRef.current = provider;

    // Handle connection status
    provider.on('status', ({ status }: { status: string }) => {
      setIsConnected(status === 'connected');
    });

    // Mark as ready after setup
    setIsReady(true);

    return () => {
      provider.destroy();
      ydoc.destroy();
      setIsReady(false);
    };
  }, [roomId, websocketUrl]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Disable history as it's handled by Yjs
        }),
        ...(isReady && ydocRef.current && providerRef.current
          ? [
              Collaboration.configure({
                document: ydocRef.current,
              }),
              CollaborationCursor.configure({
                provider: providerRef.current,
                user: {
                  id: Math.random().toString(36).substr(2, 9),
                  name: `User ${Math.floor(Math.random() * 1000)}`,
                  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                },
              }),
            ]
          : []),
      ],
      content: content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setContent(html);
      },
    },
    [isReady]
  );

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

  const toggleHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
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
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className='flex items-center gap-1 text-gray-500'>
            <RiCheckLine className='size-4 text-green-500' />
            Saved
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
