import Editor from '@monaco-editor/react';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { LANGUAGE_LABELS } from '@/lib/languages';

const languageMap: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  bash: 'shell',
  rust: 'rust',
  'c++': 'cpp',
  c: 'c',
  java: 'java',
  go: 'go',
  php: 'php',
  ruby: 'ruby',
};

export const CodeEditorPanel = () => {
  const { currentQuestion, codeMap, setCode, submission } = useTakeAssessment();

  if (!currentQuestion) return null;

  const selectedLanguage = submission?.selectedLanguage ?? '';
  const monacoLanguage = languageMap[selectedLanguage] ?? 'plaintext';
  const value = codeMap[currentQuestion.id] ?? '';
  const languageLabel =
    LANGUAGE_LABELS[selectedLanguage as keyof typeof LANGUAGE_LABELS] ?? selectedLanguage;

  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50'>
        <LanguageIcon language={selectedLanguage} />
        <span className='text-sm font-medium text-gray-700'>{languageLabel}</span>
      </div>
      <div className='flex-1 min-h-0'>
        <Editor
          language={monacoLanguage}
          value={value}
          onChange={(newValue) => {
            setCode(currentQuestion.id, newValue ?? '');
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12 },
          }}
          theme='light'
        />
      </div>
    </div>
  );
};
