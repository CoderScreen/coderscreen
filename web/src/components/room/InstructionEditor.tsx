import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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

export const InstructionEditor = () => {
  const [content, setContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
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

        <div className='flex items-center gap-1 text-sm text-gray-500'>
          <RiCheckLine className='size-4 text-green-500' />
          Saved
        </div>
      </div>

      <div
        className='flex-1 min-h-0 overflow-auto'
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className='p-2 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </div>
    </div>
  );
};
