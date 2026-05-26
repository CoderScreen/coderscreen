import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';

interface QuestionPanelProps {
  question: {
    id: string;
    description: Record<string, unknown>;
  };
}

export const QuestionPanel = ({ question }: QuestionPanelProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: question.description ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 focus:outline-none',
      },
    },
  });

  // Update editor content when question changes
  useEffect(() => {
    if (editor && question.description) {
      editor.commands.setContent(question.description);
    }
  }, [editor, question.id, question.description]);

  return (
    <div className='h-full overflow-y-auto'>
      <EditorContent editor={editor} />
    </div>
  );
};
