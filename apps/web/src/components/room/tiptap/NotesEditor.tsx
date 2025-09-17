import { EditorContent } from '@tiptap/react';
import { useNotesEditor } from '@/query/realtime/notes.query';
import { TipTapHeader } from './TipTapHeader';

export const NotesEditor = () => {
  const editor = useNotesEditor();

  return (
    <div className='w-full h-full flex flex-col bg-white'>
      <TipTapHeader editor={editor} />

      <div className='px-3 py-2 text-xs text-amber-800/80 bg-amber-50'>
        These notes are private to you. They are not visible to the candidate, but can be viewed by
        others in your organization.
      </div>

      <div
        role='button'
        tabIndex={0}
        className='flex-1 min-h-0 overflow-auto'
        onClick={() => editor?.chain()?.focus()?.run()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            editor?.chain()?.focus()?.run();
          }
        }}
      >
        <EditorContent
          editor={editor}
          className='px-2 py-4 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </div>
    </div>
  );
};
