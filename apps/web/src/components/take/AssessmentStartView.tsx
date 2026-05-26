import { Button } from '@coderscreen/ui/button';
import { Input } from '@coderscreen/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { RiCodeLine, RiListCheck2, RiPlayLine, RiTimeLine } from '@remixicon/react';
import { useState } from 'react';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { useTakeAssessment } from '@/contexts/TakeAssessmentContext';
import { useStartAssessment } from '@/query/candidateAssessment.query';

const LANGUAGE_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  bash: 'Bash',
  rust: 'Rust',
  'c++': 'C++',
  c: 'C',
  java: 'Java',
  go: 'Go',
  php: 'PHP',
  ruby: 'Ruby',
};

export const AssessmentStartView = () => {
  const { assessment, submission, subId, token } = useTakeAssessment();
  const { startAssessment, isLoading } = useStartAssessment(subId, token);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [enteredName, setEnteredName] = useState<string>(
    (submission as any)?.candidateName ?? ''
  );
  const [enteredEmail, setEnteredEmail] = useState<string>('');

  if (!assessment) return null;

  const candidateEmail = (submission as any)?.candidateEmail as string | null;
  const isGenericLink = !candidateEmail;

  const formatTimeLimit = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.round((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${Math.round(seconds / 60)} minutes`;
  };

  const handleStart = async () => {
    if (!selectedLanguage || !enteredName.trim()) return;
    await startAssessment({
      selectedLanguage,
      enteredName: enteredName.trim(),
      ...(isGenericLink && enteredEmail.trim() ? { enteredEmail: enteredEmail.trim() } : {}),
    });
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-lg mx-4'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-8'>
          <div className='text-center mb-6'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4'>
              <RiCodeLine className='w-6 h-6 text-blue-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>{assessment.title}</h1>
            {assessment.description && (
              <p className='text-sm text-gray-500 mt-2'>{assessment.description}</p>
            )}
          </div>

          <div className='flex items-center justify-center gap-4 mb-6'>
            {assessment.timeLimitSeconds && (
              <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                <RiTimeLine className='w-4 h-4' />
                <span>{formatTimeLimit(assessment.timeLimitSeconds)}</span>
              </div>
            )}
            <div className='flex items-center gap-1.5 text-sm text-gray-600'>
              <RiListCheck2 className='w-4 h-4' />
              <span>
                {assessment.questions.length} question{assessment.questions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className='space-y-4'>
            {candidateEmail ? (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email</label>
                <Input value={candidateEmail} disabled className='bg-gray-50' />
              </div>
            ) : (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email</label>
                <Input
                  type='email'
                  value={enteredEmail}
                  onChange={(e) => setEnteredEmail(e.target.value)}
                  placeholder='Enter your email'
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Your Name</label>
              <Input
                value={enteredName}
                onChange={(e) => setEnteredName(e.target.value)}
                placeholder='Enter your full name'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Programming Language
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a language...' />
                </SelectTrigger>
                <SelectContent>
                  {assessment.allowedLanguages.map((lang) => (
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

            <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
              <p className='text-sm text-amber-800'>
                Once started, the timer cannot be paused. Make sure you have a stable internet
                connection and enough time to complete the assessment.
              </p>
            </div>

            <Button
              className='w-full'
              icon={RiPlayLine}
              onClick={handleStart}
              isLoading={isLoading}
              disabled={!selectedLanguage || !enteredName.trim()}
            >
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
