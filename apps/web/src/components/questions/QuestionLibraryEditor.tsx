import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { MutedText } from '@coderscreen/ui/typography';
import { RiArrowLeftLine, RiArrowRightLine, RiCheckboxCircleLine, RiSaveLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TipTapHeader } from '@/components/room/tiptap/TipTapHeader';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { TestCasesList } from '@/components/assessments/detail/TestCasesList';
import {
  useCreateQuestionLibrary,
  useCreateQuestionLibraryTestCase,
  useDeleteQuestionLibraryTestCase,
  useUpdateQuestionLibrary,
  useUpdateQuestionLibraryTestCase,
} from '@/query/questionLibrary.query';

interface QuestionLibraryEditorProps {
  mode: 'create' | 'edit';
  question?: {
    id: string;
    title: string;
    description: Record<string, unknown>;
    starterCode: string;
    timeLimitSeconds: number | null;
    testCases?: {
      id: string;
      label: string;
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      position: number;
    }[];
  };
}

export const QuestionLibraryEditor = ({
  mode,
  question,
}: QuestionLibraryEditorProps) => {
  const navigate = useNavigate();
  const { createQuestion, isLoading: isCreating } = useCreateQuestionLibrary();
  const { updateQuestion, isLoading: isUpdating } = useUpdateQuestionLibrary();
  const isLoading = isCreating || isUpdating;

  const [isDescriptionDirty, setIsDescriptionDirty] = useState(false);

  const { createTestCase, isLoading: isCreatingTC } = useCreateQuestionLibraryTestCase(
    question?.id ?? ''
  );
  const { updateTestCase, isLoading: isUpdatingTC } = useUpdateQuestionLibraryTestCase(
    question?.id ?? ''
  );
  const { deleteTestCase } = useDeleteQuestionLibraryTestCase(question?.id ?? '');

  const editor = useEditor({
    extensions: [StarterKit],
    content:
      mode === 'edit' && question
        ? question.description
        : { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-3 focus:outline-none h-full',
      },
    },
    onUpdate: () => {
      setIsDescriptionDirty(true);
    },
  });

  const form = useForm({
    defaultValues: {
      title: mode === 'edit' && question ? question.title : '',
    },
    onSubmit: async ({ value }) => {
      const description = editor?.getJSON() ?? {};

      if (mode === 'create') {
        const result = await createQuestion({
          title: value.title,
          description,
          starterCode: '',
          timeLimitSeconds: null,
        });

        const newQuestion = result as { id: string };
        navigate({
          to: '/questions/$questionId/edit',
          params: { questionId: newQuestion.id },
        });
      } else if (question) {
        await updateQuestion({
          id: question.id,
          data: {
            title: value.title,
            description,
          },
        });

        setIsDescriptionDirty(false);
      }
    },
  });


  return (
    <div className='w-full px-4 flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between py-4'>
        <div className='flex items-center gap-2'>
          <Link to='/questions'>
            <Button type='button' variant='ghost' icon={RiArrowLeftLine} className='p-1' />
          </Link>
          <SmallHeader>{mode === 'create' ? 'New Question' : 'Edit Question'}</SmallHeader>
        </div>
        {mode === 'create' ? (
          <Button
            type='button'
            isLoading={isLoading}
            icon={RiArrowRightLine}
            iconPosition='right'
            onClick={() => form.handleSubmit()}
          >
            Create Question
          </Button>
        ) : (
          <form.Subscribe selector={(state) => state.isDirty}>
            {(isFormDirty) => (
              <Button
                type='button'
                isLoading={isLoading}
                disabled={!isFormDirty && !isDescriptionDirty}
                icon={RiSaveLine}
                iconPosition='right'
                onClick={() => form.handleSubmit()}
              >
                Save Changes
              </Button>
            )}
          </form.Subscribe>
        )}
      </div>

      {/* Content */}
      <div className='flex flex-col flex-1 min-h-0 pb-4'>
        {/* Title */}
        <form.Field
          name='title'
          validators={{
            onChange: ({ value }: { value: string }) => {
              if (!value) return 'Title is required';
              if (value.length > 200) return 'Title must be less than 200 characters';
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className='mb-3'>
              <Label
                htmlFor={field.name}
                className='block text-sm font-medium text-gray-700 mb-1.5'
              >
                Title
              </Label>
              <Input
                id={field.name}
                placeholder='e.g., Two Sum'
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                hasError={!field.state.meta.isValid}
              />
              {field.state.meta.errors?.length > 0 && (
                <p className='text-sm text-red-600 mt-1'>{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Resizable side-by-side panels */}
        <div className='flex-1 min-h-0'>
          <PanelGroup direction='horizontal'>
            {/* Description (TipTap) */}
            <Panel defaultSize={50} minSize={25}>
              <div className='h-full flex flex-col'>
                <Label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Description
                </Label>
                <div className='border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0'>
                  <TipTapHeader editor={editor} />
                  <div className='flex-1 overflow-y-auto'>
                    <EditorContent editor={editor} className='h-full' />
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className='w-2 flex items-center justify-center group cursor-col-resize'>
              <div className='w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-gray-400 group-active:bg-gray-500 transition-colors' />
            </PanelResizeHandle>

            {/* Test Cases */}
            <Panel defaultSize={50} minSize={25}>
              <div className='h-full flex flex-col'>
                <Label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Test Cases
                </Label>
                <div className='border border-gray-200 rounded-lg flex-1 min-h-0 overflow-y-auto p-3'>
                  {mode === 'edit' && question ? (
                    <TestCasesList
                      testCases={question.testCases ?? []}
                      callbacks={{
                        createTestCase,
                        updateTestCase,
                        deleteTestCase,
                        isCreating: isCreatingTC,
                        isUpdating: isUpdatingTC,
                      }}
                    />
                  ) : (
                    <div className='h-full flex flex-col items-center justify-center text-center py-8 space-y-3'>
                      <EmptyStateIcon icon={RiCheckboxCircleLine} />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>No test cases yet</p>
                        <MutedText className='text-sm'>
                          Save the question first to add test cases.
                        </MutedText>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};
