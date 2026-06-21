import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { tiptapContentClass } from '@/components/room/tiptap/editorStyles';

interface QuestionPanelProps {
  question: {
    id: string;
    title: string;
    description: Record<string, unknown>;
  };
  questionIndex?: number;
}

export const QuestionPanel = ({ question, questionIndex }: QuestionPanelProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: question.description ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable: false,
    editorProps: {
      attributes: {
        class: tiptapContentClass('p-4'),
      },
    },
  });

  // Update editor content when question changes
  useEffect(() => {
    if (editor && question.description) {
      editor.commands.setContent(question.description);
    }
  }, [editor, question.description]);

  return (
    <div className='h-full overflow-y-auto'>
      <div className='px-4 pt-4'>
        <h1 className='text-lg font-semibold text-gray-900'>
          {questionIndex !== undefined ? `${questionIndex + 1}. ` : ''}
          {question.title}
        </h1>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
