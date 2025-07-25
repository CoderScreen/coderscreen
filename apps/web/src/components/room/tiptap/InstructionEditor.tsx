import { EditorContent } from '@tiptap/react';
import { TipTapHeader } from './TipTapHeader';
import {
  useGuestInstructionEditor,
  useInstructionEditor,
} from '@/query/realtime/instruction.query';

export const InstructionEditor = (props: { isGuest?: boolean }) => {
  const editor = props.isGuest ? useGuestInstructionEditor() : useInstructionEditor();

  return (
    <div className='w-full h-full flex flex-col bg-white'>
      <TipTapHeader editor={editor} />
      <div className='flex-1 min-h-0 overflow-auto' onClick={() => editor?.chain()?.focus()?.run()}>
        <EditorContent
          editor={editor}
          className='p-4 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </div>
    </div>
  );
};
