import type { ChangeLanguageSchema } from '@coderscreen/api/schema/assessment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { CodeEditor } from '@/components/common/CodeEditor';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { LANGUAGE_LABELS } from '@/lib/languages';
import { useChangeLanguage } from '@/query/candidateAssessment.query';

interface CodeEditorPanelProps {
  question: { id: string };
}

export const CodeEditorPanel = ({ question }: CodeEditorPanelProps) => {
  const { codeMap, setCode, submission, assessment, subId, token } = useTakeAssessment();
  const { changeLanguage } = useChangeLanguage(subId, token);

  const selectedLanguage = submission?.selectedLanguage ?? '';
  const value = codeMap[question.id] ?? '';
  const allowedLanguages = assessment?.allowedLanguages ?? [];

  const handleLanguageChange = async (language: ChangeLanguageSchema['selectedLanguage']) => {
    await changeLanguage({ selectedLanguage: language });
  };

  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex items-center px-3 py-1.5 border-b'>
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
      </div>
      <div className='flex-1 min-h-0'>
        <CodeEditor
          language={selectedLanguage}
          value={value}
          onChange={(newValue) => setCode(question.id, newValue)}
          className='h-full border-none rounded-none'
        />
      </div>
    </div>
  );
};
