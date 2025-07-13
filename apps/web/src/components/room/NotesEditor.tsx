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
import { useNotesEditor } from '@/query/realtime/notes.query';

export const NotesEditor = () => {
  const editor = useNotesEditor();

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
          <Button variant='icon' onClick={toggleBold} disabled={!editor?.isEditable}>
            <RiBold className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleItalic} disabled={!editor?.isEditable}>
            <RiItalic className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleStrike} disabled={!editor?.isEditable}>
            <RiStrikethrough className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleCode} disabled={!editor?.isEditable}>
            <RiCodeLine className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleBlockquote} disabled={!editor?.isEditable}>
            <RiDoubleQuotesL className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleOrderedList} disabled={!editor?.isEditable}>
            <RiListOrdered className='size-4' />
          </Button>
          <Button variant='icon' onClick={toggleBulletList} disabled={!editor?.isEditable}>
            <RiListUnordered className='size-4' />
          </Button>
        </div>
      </div>

      <div className='px-3 py-2 text-xs text-amber-800/80 bg-amber-50'>
        These notes are private to you. They are not visible to the candidate, but can be viewed by
        others in your organization.
      </div>

      <div className='flex-1 min-h-0 overflow-auto' onClick={() => editor?.chain()?.focus()?.run()}>
        <EditorContent
          editor={editor}
          className='px-2 py-4 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </div>
    </div>
  );
};
