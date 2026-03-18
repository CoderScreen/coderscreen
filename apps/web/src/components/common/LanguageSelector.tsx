import { Checkbox } from '@coderscreen/ui/checkbox';
import { ASSESSMENT_LANGUAGES, LANGUAGE_LABELS } from '@/lib/languages';
import { LanguageIcon } from './LanguageIcon';

interface LanguageSelectorProps {
  value: string[];
  onChange: (languages: string[]) => void;
}

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  return (
    <div className='grid grid-cols-3 gap-2'>
      {ASSESSMENT_LANGUAGES.map((lang) => (
        <label key={lang} className='flex items-center gap-2 text-sm cursor-pointer'>
          <Checkbox
            checked={value.includes(lang)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...value, lang]);
              } else {
                onChange(value.filter((l) => l !== lang));
              }
            }}
          />
          <LanguageIcon language={lang} />
          {LANGUAGE_LABELS[lang]}
        </label>
      ))}
    </div>
  );
};
