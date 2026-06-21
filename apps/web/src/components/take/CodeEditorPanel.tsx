import type { ChangeLanguageSchema } from '@coderscreen/api/schema/assessment';
import { Button } from '@coderscreen/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { RiResetLeftLine } from '@remixicon/react';
import { useState } from 'react';
import { CodeEditor } from '@/components/common/CodeEditor';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { LANGUAGE_LABELS } from '@/lib/languages';
import { useChangeLanguage } from '@/query/candidateAssessment.query';

interface CodeEditorPanelProps {
  question: { id: string };
}

export const CodeEditorPanel = ({ question }: CodeEditorPanelProps) => {
  const { getCode, setCode, resetCodeToStarter, submission, assessment, subId, token, saveCurrentCode } =
    useTakeAssessment();
  const { changeLanguage } = useChangeLanguage(subId, token);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const selectedLanguage = submission?.selectedLanguage ?? '';
  const value = getCode(question.id);
  const allowedLanguages = assessment?.allowedLanguages ?? [];

  const handleLanguageChange = async (language: ChangeLanguageSchema['selectedLanguage']) => {
    // Flush the current-language buffer to the server before switching, so the
    // candidate's most recent edits in the current language don't get
    // shadowed by a stale saved blob from a previous session.
    await saveCurrentCode();
    await changeLanguage({ selectedLanguage: language });
  };

  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex items-center justify-between px-3 py-1.5 border-b'>
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className='w-auto border-none shadow-none bg-transparent gap-2 cursor-pointer'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                <div className='flex items-center gap-2'>
                  <LanguageIcon language={lang} />
                  <span>{LANGUAGE_LABELS[lang] ?? lang}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='ghost'
          icon={RiResetLeftLine}
          onClick={() => setConfirmResetOpen(true)}
          className='text-xs text-gray-500'
        >
          Reset to starter
        </Button>
      </div>
      <div className='flex-1 min-h-0'>
        <CodeEditor
          language={selectedLanguage}
          value={value}
          onChange={(newValue) => setCode(question.id, newValue)}
          className='h-full border-none rounded-none'
        />
      </div>

      <ConfirmDeleteDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        onConfirm={() => {
          resetCodeToStarter(question.id);
          setConfirmResetOpen(false);
        }}
        title='Reset to starter?'
        description='This replaces your current code with the question starter. Your edits in this language will be lost.'
      />
    </div>
  );
};
