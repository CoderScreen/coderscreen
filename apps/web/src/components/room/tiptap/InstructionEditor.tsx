import { Editor, EditorContent } from '@tiptap/react';
import {
  useGuestInstructionEditor,
  useInstructionEditor,
} from '@/query/realtime/instruction.query';
import { TipTapHeader } from './TipTapHeader';

export const InstructionEditor = (props: { isGuest?: boolean }) => {
  return props.isGuest ? <GuestInstructionEditor /> : <HostInstructionEditor />;
};

const GuestInstructionEditor = () => {
  const editor = useGuestInstructionEditor();

  return <InstructionBody editor={editor} />;
};

const HostInstructionEditor = () => {
  const editor = useInstructionEditor();

  return <InstructionBody editor={editor} />;
};

const InstructionBody = ({ editor }: { editor: Editor | null }) => {
  return (
    <div className='w-full h-full flex flex-col bg-white'>
      <TipTapHeader editor={editor} />
      <button
        type='button'
        className='flex-1 min-h-0 overflow-auto text-left'
        onClick={() => editor?.chain()?.focus()?.run()}
      >
        <EditorContent
          editor={editor}
          className='p-4 h-full min-h-full w-full focus:outline-none focus:ring-0 focus:border-none prose prose-sm max-w-none'
        />
      </button>
    </div>
  );
};
