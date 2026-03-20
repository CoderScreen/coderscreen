import { Button } from '@coderscreen/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '@coderscreen/ui/table';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiAddLine,
  RiBookLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiContactsBookUploadLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiPencilLine,
  RiTimeLine,
} from '@remixicon/react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { Pagination } from '@/components/common/Pagination';
import { useDeleteQuestion, useLinkQuestion, useUpdateAssessment } from '@/query/assessment.query';
import { useQuestionLibrary } from '@/query/questionLibrary.query';

interface QuestionItem {
  id: string;
  questionId?: string;
  title: string;
  description: Record<string, unknown>;
  position: number;
  timeLimitSeconds: number | null;
  starterCode: string;
  testCases?: {
    id: string;
    label: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    position: number;
  }[];
}

interface AssessmentQuestionsTabProps {
  assessment: {
    id: string;
    timeLimitSeconds?: number | null;
    questions?: QuestionItem[];
    questionsPagination?: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
  onQuestionsPageChange?: (page: number) => void;
}

export const AssessmentQuestionsTab = ({ assessment, onQuestionsPageChange }: AssessmentQuestionsTabProps) => {
  const navigate = useNavigate();
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);

  const questions = assessment.questions ?? [];
  const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);

  const goToNewQuestion = () => {
    navigate({
      to: '/assessments/$assessmentId/questions/new',
      params: { assessmentId: assessment.id },
    });
  };

  const goToEditQuestion = (questionId: string) => {
    navigate({
      to: '/assessments/$assessmentId/questions/$questionId/edit',
      params: { assessmentId: assessment.id, questionId },
    });
  };

  return (
    <div className='py-6'>
      {/* Time limit control */}
      <TimeLimitControl
        assessmentId={assessment.id}
        timeLimitSeconds={assessment.timeLimitSeconds ?? null}
      />

      {/* Questions header */}
      <div className='flex items-center justify-between mb-4 mt-6'>
        <MutedText>
          {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}
        </MutedText>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button icon={RiAddLine}>Add Question</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={goToNewQuestion}>
              <RiFileTextLine className='size-4 mr-2' />
              Create New Question
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLibraryDialogOpen(true)}>
              <RiContactsBookUploadLine className='size-4 mr-2' />
              From Question Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <QuestionLibraryDialog
        open={libraryDialogOpen}
        onOpenChange={setLibraryDialogOpen}
        assessmentId={assessment.id}
        existingQuestionIds={questions.map((q) => q.questionId ?? '')}
        nextPosition={sortedQuestions.length}
      />

      {/* Questions table */}
      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className='w-12'>#</TableHeaderCell>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Test Cases</TableHeaderCell>
              <TableHeaderCell className='w-20' />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className='flex flex-col items-center justify-center py-12 px-4'>
                    <EmptyStateIcon icon={RiFileTextLine} />
                    <SmallHeader className='mt-4'>No questions yet</SmallHeader>
                    <MutedText>Add your first question to get started.</MutedText>
                    <Button
                      variant='primary'
                      icon={RiAddLine}
                      className='mt-4'
                      onClick={goToNewQuestion}
                    >
                      Add Question
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedQuestions.map((question, index) => (
                <QuestionRow
                  key={question.id}
                  question={question}
                  index={index}
                  assessmentId={assessment.id}
                  onEdit={() => goToEditQuestion(question.id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>

      {assessment.questionsPagination && onQuestionsPageChange && (
        <Pagination
          page={assessment.questionsPagination.page}
          totalPages={assessment.questionsPagination.totalPages}
          onPageChange={onQuestionsPageChange}
        />
      )}
    </div>
  );
};

interface TimeLimitControlProps {
  assessmentId: string;
  timeLimitSeconds: number | null;
}

const TimeLimitControl = ({ assessmentId, timeLimitSeconds }: TimeLimitControlProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [minutes, setMinutes] = useState(
    timeLimitSeconds ? String(Math.floor(timeLimitSeconds / 60)) : ''
  );
  const { updateAssessment, isLoading } = useUpdateAssessment();

  const handleSave = async () => {
    const value = minutes.trim();
    const newLimit = value && Number(value) > 0 ? Number(value) * 60 : null;
    await updateAssessment({
      id: assessmentId,
      data: { timeLimitSeconds: newLimit },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMinutes(timeLimitSeconds ? String(Math.floor(timeLimitSeconds / 60)) : '');
    setIsEditing(false);
  };

  const displayText = timeLimitSeconds
    ? `${Math.floor(timeLimitSeconds / 60)} minutes`
    : 'No limit';

  return (
    <div className='flex items-center gap-2'>
      <RiTimeLine className='size-4 text-gray-400' />
      <span className='text-sm text-gray-500'>Time Limit:</span>

      {isEditing ? (
        <>
          <Input
            type='number'
            min={1}
            placeholder='No limit'
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') handleCancel();
            }}
            className='w-24 h-7 text-sm'
            autoFocus
          />
          <span className='text-sm text-gray-400'>min</span>
          <Button
            type='button'
            variant='ghost'
            className='p-0.5'
            onClick={handleSave}
            isLoading={isLoading}
          >
            {!isLoading && <RiCheckLine className='size-4 text-green-600' />}
          </Button>
          <Button type='button' variant='ghost' className='p-0.5' onClick={handleCancel}>
            <RiCloseLine className='size-4 text-gray-400' />
          </Button>
        </>
      ) : (
        <>
          <span className='text-sm font-medium text-gray-900'>{displayText}</span>
          <Button
            type='button'
            variant='ghost'
            className='p-0.5'
            onClick={() => setIsEditing(true)}
          >
            <RiPencilLine className='size-3.5 text-gray-400' />
          </Button>
        </>
      )}
    </div>
  );
};

interface QuestionRowProps {
  question: QuestionItem;
  index: number;
  assessmentId: string;
  onEdit: () => void;
}

const QuestionRow = ({ question, index, assessmentId, onEdit }: QuestionRowProps) => {
  const { deleteQuestion } = useDeleteQuestion(assessmentId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const testCases = question.testCases ?? [];

  return (
    <>
      <TableRow className='cursor-pointer hover:bg-gray-50' onClick={onEdit}>
        <TableCell className='text-gray-500 font-medium'>{index + 1}</TableCell>
        <TableCell>{question.title}</TableCell>
        <TableCell>
          <span className='inline-flex items-center gap-1 text-gray-500'>
            <RiCheckboxCircleLine className='size-3.5' />
            {testCases.length}
          </span>
        </TableCell>
        <TableCell>
          <Button
            variant='ghost'
            className='p-1 text-red-500 hover:text-red-600'
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <RiDeleteBinLine className='size-4' />
          </Button>
        </TableCell>
      </TableRow>
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          deleteQuestion(question.id);
          setDeleteOpen(false);
        }}
        title='Delete Question'
        description='Are you sure you want to delete this question and its test cases? This action cannot be undone.'
      />
    </>
  );
};

// === Question Library Picker Dialog ===

interface QuestionLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  existingQuestionIds: string[];
  nextPosition: number;
}

const QuestionLibraryDialog = ({
  open,
  onOpenChange,
  assessmentId,
  existingQuestionIds,
  nextPosition,
}: QuestionLibraryDialogProps) => {
  const { questions, isLoading } = useQuestionLibrary();
  const { linkQuestion, isLoading: isLinking } = useLinkQuestion(assessmentId);
  const [search, setSearch] = useState('');

  const availableQuestions = (questions ?? []).filter((q) => !existingQuestionIds.includes(q.id));

  const filteredQuestions = search.trim()
    ? availableQuestions.filter((q) => q.title.toLowerCase().includes(search.toLowerCase()))
    : availableQuestions;

  const handleAdd = async (libraryQuestionId: string) => {
    await linkQuestion({ libraryQuestionId, position: nextPosition });
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add from Question Library</DialogTitle>
        </DialogHeader>

        <Input
          placeholder='Search questions...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='mb-3'
        />

        <div className='max-h-80 overflow-y-auto'>
          {isLoading ? (
            <p className='text-sm text-gray-500 text-center py-8'>Loading questions...</p>
          ) : filteredQuestions.length === 0 ? (
            <div className='text-center py-8'>
              <EmptyStateIcon icon={RiBookLine} />
              <p className='text-sm text-gray-500 mt-2'>
                {availableQuestions.length === 0
                  ? 'No library questions available. Create one first.'
                  : 'No matching questions found.'}
              </p>
            </div>
          ) : (
            <TableRoot>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell className='w-20' />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuestions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.title}</TableCell>
                      <TableCell>
                        <Button
                          variant='secondary'
                          className='text-xs h-7'
                          icon={RiAddLine}
                          onClick={() => handleAdd(q.id)}
                          isLoading={isLinking}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
