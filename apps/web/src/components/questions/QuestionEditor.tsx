import type {
  FunctionModeLanguage,
  Parameter,
  Signature,
  TypeString,
} from '@coderscreen/common/types';
import { Button } from '@coderscreen/ui/button';
import { Divider } from '@coderscreen/ui/divider';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine, RiArrowLeftLine, RiSaveLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useMemo, useState } from 'react';
import { SignatureEditor } from '@/components/questions/SignatureEditor';
import { TestCaseRow, type TestCaseRowData } from '@/components/questions/TestCaseRow';
import { tiptapContentClass } from '@/components/room/tiptap/editorStyles';
import { TipTapHeader } from '@/components/room/tiptap/TipTapHeader';
import {
  useCreateQuestion,
  useCreateTestCase,
  useDeleteTestCase,
  useUpdateQuestion,
  useUpdateTestCase,
} from '@/query/assessment.query';
import {
  useCreateQuestionLibrary,
  useCreateQuestionLibraryTestCase,
  useDeleteQuestionLibraryTestCase,
  useUpdateQuestionLibrary,
  useUpdateQuestionLibraryTestCase,
} from '@/query/questionLibrary.query';

type Context = 'library' | 'assessment';
type Mode = 'create' | 'edit';

interface QuestionShape {
  id: string;
  title: string;
  description: Record<string, unknown>;
  position?: number;
  points?: number;
  timeLimitSeconds: number | null;
  functionName: string;
  parameters: Parameter[];
  returnType: TypeString;
  starterCode: Partial<Record<FunctionModeLanguage, string>>;
  testCases?: TestCaseRowData[];
}

interface QuestionEditorProps {
  context: Context;
  mode: Mode;
  question?: QuestionShape;
  // Assessment-only fields:
  assessmentId?: string;
  nextPosition?: number;
}

const DEFAULT_SIGNATURE: Signature = {
  functionName: '',
  parameters: [],
  returnType: 'null',
};

const NEW_DESCRIPTION_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

export const QuestionEditor = ({
  context,
  mode,
  question,
  assessmentId,
  nextPosition = 0,
}: QuestionEditorProps) => {
  const navigate = useNavigate();

  // Question CRUD — both hook sets are always created (cheap useMutation
  // wrappers); the active one is chosen by `context` at call time.
  const libCreate = useCreateQuestionLibrary();
  const libUpdate = useUpdateQuestionLibrary();
  const aqCreate = useCreateQuestion(assessmentId ?? '');
  const aqUpdate = useUpdateQuestion(assessmentId ?? '');

  // Test case CRUD.
  const qId = question?.id ?? '';
  const libCreateTC = useCreateQuestionLibraryTestCase(qId);
  const libUpdateTC = useUpdateQuestionLibraryTestCase(qId);
  const libDeleteTC = useDeleteQuestionLibraryTestCase(qId);
  const aqCreateTC = useCreateTestCase(assessmentId ?? '', qId);
  const aqUpdateTC = useUpdateTestCase(assessmentId ?? '', qId);
  const aqDeleteTC = useDeleteTestCase(assessmentId ?? '', qId);

  const isCreatingQuestion = libCreate.isLoading || aqCreate.isLoading;
  const isSavingQuestion = libUpdate.isLoading || aqUpdate.isLoading;

  // ===== Local form state =====
  const [signature, setSignature] = useState<Signature>(() =>
    mode === 'edit' && question
      ? {
          functionName: question.functionName ?? DEFAULT_SIGNATURE.functionName,
          parameters: question.parameters ?? DEFAULT_SIGNATURE.parameters,
          returnType: question.returnType ?? DEFAULT_SIGNATURE.returnType,
        }
      : DEFAULT_SIGNATURE
  );

  const [starterOverrides, setStarterOverrides] = useState<
    Partial<Record<FunctionModeLanguage, string>>
  >(() => (mode === 'edit' && question ? question.starterCode : {}));

  // Per-section dirty flags. Each section's Save button toggles its flag back
  // to false on a successful save.
  const [detailsDirty, setDetailsDirty] = useState(false);
  const [signatureDirty, setSignatureDirty] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: mode === 'edit' && question ? question.description : NEW_DESCRIPTION_DOC,
    editorProps: {
      attributes: { class: tiptapContentClass('p-3 min-h-[160px]') },
    },
    onUpdate: () => setDetailsDirty(true),
  });

  const form = useForm({
    defaultValues: {
      title: mode === 'edit' && question ? question.title : '',
      points: mode === 'edit' && question ? (question.points ?? 100) : 100,
    },
  });

  // ===== Test case UI state =====
  const [expandedTcId, setExpandedTcId] = useState<string | null>(null);

  // ===== Create flow (one Save covers all fields) =====
  const handleCreate = async () => {
    const description = editor?.getJSON() ?? {};
    const values = form.state.values;

    const basePayload = {
      title: values.title,
      description,
      functionName: signature.functionName,
      parameters: signature.parameters,
      returnType: signature.returnType,
      starterCode: starterOverrides,
    };

    if (context === 'library') {
      const result = await libCreate.createQuestion({
        ...basePayload,
        timeLimitSeconds: null,
      });
      const newQuestion = result as { id: string };
      navigate({
        to: '/questions/$questionId/edit',
        params: { questionId: newQuestion.id },
      });
    } else {
      if (!assessmentId) return;
      const result = await aqCreate.createQuestion({
        ...basePayload,
        position: nextPosition,
        points: values.points,
        timeLimitSeconds: null,
      });
      const newQuestion = result as { id: string };
      navigate({
        to: '/assessments/$assessmentId/questions/$questionId/edit',
        params: { assessmentId, questionId: newQuestion.id },
      });
    }
  };

  // ===== Per-section save (edit mode) =====
  const saveDetails = async () => {
    if (!question) return;
    const description = editor?.getJSON() ?? {};
    const values = form.state.values;
    if (context === 'library') {
      await libUpdate.updateQuestion({
        id: question.id,
        data: { title: values.title, description },
      });
    } else {
      await aqUpdate.updateQuestion({
        questionId: question.id,
        data: { title: values.title, description, points: values.points },
      });
    }
    setDetailsDirty(false);
  };

  const saveSignature = async () => {
    if (!question) return;
    const payload = {
      functionName: signature.functionName,
      parameters: signature.parameters,
      returnType: signature.returnType,
      starterCode: starterOverrides,
    };
    if (context === 'library') {
      await libUpdate.updateQuestion({ id: question.id, data: payload });
    } else {
      await aqUpdate.updateQuestion({ questionId: question.id, data: payload });
    }
    setSignatureDirty(false);
  };

  // ===== Test case callbacks =====
  const callTestCaseCreate = async (data: {
    label: string;
    args: unknown[];
    expectedReturn: unknown;
    isHidden: boolean;
    position: number;
  }) => {
    if (context === 'library') {
      return await libCreateTC.createTestCase(data);
    }
    return await aqCreateTC.createTestCase(data);
  };
  const callTestCaseUpdate = async (args: {
    testCaseId: string;
    data: {
      label?: string;
      args?: unknown[];
      expectedReturn?: unknown;
      isHidden?: boolean;
    };
  }) => {
    if (context === 'library') {
      return await libUpdateTC.updateTestCase(args);
    }
    return await aqUpdateTC.updateTestCase(args);
  };
  const callTestCaseDelete = async (id: string) => {
    if (context === 'library') {
      return await libDeleteTC.deleteTestCase(id);
    }
    return await aqDeleteTC.deleteTestCase(id);
  };

  const tcCreating = context === 'library' ? libCreateTC.isLoading : aqCreateTC.isLoading;
  const tcUpdating = context === 'library' ? libUpdateTC.isLoading : aqUpdateTC.isLoading;

  const testCases = useMemo(
    () => [...(question?.testCases ?? [])].sort((a, b) => a.position - b.position),
    [question?.testCases]
  );

  const signatureIsSet = (signature.functionName ?? '').trim().length > 0;

  const backTo =
    context === 'library'
      ? { to: '/questions' as const }
      : { to: '/assessments/$assessmentId' as const, params: { assessmentId: assessmentId ?? '' } };

  // ===== Render =====
  return (
    <div className='w-full px-4 max-w-4xl flex flex-col'>
      {/* In-page header. The library page is standalone so it shows a full
          title header; inside an assessment the surrounding layout already
          renders the assessment header + tabs, so we only keep a back action
          (and the create button) to avoid a duplicate title bar. */}
      <div className='flex items-center justify-between py-4'>
        <div className='flex items-center gap-2'>
          <Link {...backTo}>
            {context === 'assessment' ? (
              <Button variant='ghost' icon={RiArrowLeftLine} className='-ml-1'>
                Back to questions
              </Button>
            ) : (
              <Button variant='ghost' icon={RiArrowLeftLine} className='p-1' />
            )}
          </Link>
          {context === 'library' && (
            <SmallHeader>{mode === 'create' ? 'New Question' : 'Edit Question'}</SmallHeader>
          )}
        </div>
        {mode === 'create' && (
          <Button
            type='button'
            isLoading={isCreatingQuestion}
            icon={RiAddLine}
            iconPosition='right'
            onClick={handleCreate}
          >
            Create question
          </Button>
        )}
      </div>

      <Divider />

      {/* Question section */}
      <section>
        <div>
          <SmallHeader>Question</SmallHeader>
          <MutedText>
            The candidate sees the title and description first. Be specific about inputs, outputs,
            and constraints.
          </MutedText>
        </div>

        <div className='mt-4 space-y-4'>
          <div className='grid grid-cols-[1fr_auto] gap-3'>
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
                <div>
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
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setDetailsDirty(true);
                    }}
                    onBlur={field.handleBlur}
                    hasError={!field.state.meta.isValid}
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className='text-sm text-red-600 mt-1'>
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {context === 'assessment' && (
              <form.Field
                name='points'
                validators={{
                  onChange: ({ value }: { value: number }) => {
                    if (!Number.isInteger(value) || value < 0)
                      return 'Points must be a non-negative integer';
                    if (value > 10000) return 'Points must be at most 10000';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className='w-28'>
                    <Label
                      htmlFor={field.name}
                      className='block text-sm font-medium text-gray-700 mb-1.5'
                    >
                      Points
                    </Label>
                    <Input
                      id={field.name}
                      type='number'
                      min={0}
                      max={10000}
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(Number(e.target.value));
                        setDetailsDirty(true);
                      }}
                      onBlur={field.handleBlur}
                      hasError={!field.state.meta.isValid}
                    />
                  </div>
                )}
              </form.Field>
            )}
          </div>

          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1.5'>Description</Label>
            <div className='border border-gray-200 rounded-lg overflow-hidden bg-white'>
              <TipTapHeader editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>

          {mode === 'edit' && (
            <div className='flex justify-end'>
              <Button
                type='button'
                icon={RiSaveLine}
                iconPosition='right'
                disabled={!detailsDirty}
                isLoading={isSavingQuestion}
                onClick={saveDetails}
              >
                Save question
              </Button>
            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* Function signature section */}
      <section>
        <div>
          <SmallHeader>Function signature</SmallHeader>
          <MutedText>
            Declare the function the candidate writes. We use this to generate per-language starter
            code and to type-check the test case args.
          </MutedText>
        </div>

        <div className='mt-4'>
          <SignatureEditor
            signature={signature}
            onChange={(s) => {
              setSignature(s);
              setSignatureDirty(true);
            }}
            starterOverrides={starterOverrides}
            onStarterOverridesChange={(o) => {
              setStarterOverrides(o);
              setSignatureDirty(true);
            }}
          />

          {mode === 'edit' && (
            <div className='mt-4 flex justify-end'>
              <Button
                type='button'
                icon={RiSaveLine}
                iconPosition='right'
                disabled={!signatureDirty}
                isLoading={isSavingQuestion}
                onClick={saveSignature}
              >
                Save signature
              </Button>
            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* Test cases section */}
      <section className='pb-12'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <SmallHeader>Test cases</SmallHeader>
            <MutedText>
              We call your function with each test case's args and compare the return value to the
              expected return. Hidden cases run on submit but stay invisible to candidates.
            </MutedText>
          </div>
          <Button
            type='button'
            variant='secondary'
            icon={RiAddLine}
            onClick={async () => {
              if (mode === 'create' || !signatureIsSet) return;
              const created = await callTestCaseCreate({
                label: '',
                args: signature.parameters.map((p) => defaultForType(p.type)),
                expectedReturn: defaultForType(signature.returnType),
                isHidden: false,
                position: testCases.length,
              });
              const newId = (created as { id?: string }).id;
              if (newId) setExpandedTcId(newId);
            }}
            disabled={mode === 'create' || !signatureIsSet || tcCreating}
            isLoading={tcCreating}
          >
            Add case
          </Button>
        </div>

        <div className='mt-4'>
          {mode === 'create' ? (
            <MutedPlaceholder>Save the question first to add test cases.</MutedPlaceholder>
          ) : !signatureIsSet ? (
            <MutedPlaceholder>
              Define the function signature first. Test cases need typed args.
            </MutedPlaceholder>
          ) : testCases.length === 0 ? (
            <MutedPlaceholder>No test cases yet. Add one to validate solutions.</MutedPlaceholder>
          ) : (
            <div className='space-y-2'>
              {testCases.map((tc, i) => (
                <TestCaseRow
                  key={tc.id}
                  index={i}
                  testCase={tc}
                  signature={{
                    functionName: signature.functionName,
                    parameters: signature.parameters,
                    returnType: signature.returnType,
                  }}
                  isExpanded={expandedTcId === tc.id}
                  isSaving={tcUpdating}
                  onExpand={() => setExpandedTcId(tc.id)}
                  onCollapse={() => setExpandedTcId(null)}
                  onSave={async (draft) => {
                    await callTestCaseUpdate({
                      testCaseId: tc.id,
                      data: draft,
                    });
                    setExpandedTcId(null);
                  }}
                  onDelete={async () => {
                    await callTestCaseDelete(tc.id);
                    if (expandedTcId === tc.id) setExpandedTcId(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ===== Sub-components =====

const MutedPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className='px-4 py-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500 text-center'>
    {children}
  </div>
);

// Sane defaults per type used when seeding a new test case.
function defaultForType(type: TypeString): unknown {
  if (type === 'string') return '';
  if (type === 'int' || type === 'float') return 0;
  if (type === 'bool') return false;
  if (type === 'null') return null;
  if (type === 'object') return {};
  if (type.startsWith('array<')) return [];
  return null;
}
