import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';

export const QuestionPanel = () => {
  const { currentQuestion } = useTakeAssessment();

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentQuestion?.description ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 focus:outline-none',
      },
    },
  });

  // Update editor content when question changes
  useEffect(() => {
    if (editor && currentQuestion?.description) {
      editor.commands.setContent(currentQuestion.description);
    }
  }, [editor, currentQuestion?.id, currentQuestion?.description]);

  if (!currentQuestion) return null;

  return (
    <div className='h-full overflow-y-auto'>
      <EditorContent editor={editor} />
    </div>
  );
};
