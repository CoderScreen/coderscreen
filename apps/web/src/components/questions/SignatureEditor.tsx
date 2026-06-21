import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { Textarea } from '@coderscreen/ui/textarea';
import {
  type FunctionModeLanguage,
  type Parameter,
  type Signature,
  type TypeString,
} from '@coderscreen/common/types';
import {
  RiAddLine,
  RiAlertLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiResetLeftLine,
} from '@remixicon/react';
import { useState } from 'react';
import {
  buildStarterForLanguage,
  FUNCTION_MODE_LANGUAGE_LABEL,
  FUNCTION_MODE_LANGUAGES,
  overrideLooksStale,
} from '@/lib/starterCode';

// Common type presets surfaced in the type dropdown. The "Custom…" option
// drops down to a text input so authors can type richer types like
// `array<array<int>>` without us building a recursive picker.
const COMMON_TYPES: { value: TypeString; label: string }[] = [
  { value: 'string', label: 'string' },
  { value: 'int', label: 'int' },
  { value: 'float', label: 'float' },
  { value: 'bool', label: 'bool' },
  { value: 'null', label: 'null' },
  { value: 'object', label: 'object' },
  { value: 'array<string>', label: 'array<string>' },
  { value: 'array<int>', label: 'array<int>' },
  { value: 'array<float>', label: 'array<float>' },
  { value: 'array<bool>', label: 'array<bool>' },
  { value: 'array<object>', label: 'array<object>' },
];

const CUSTOM_TYPE_SENTINEL = '__custom__';

const TYPE_REGEX = /^(string|int|float|bool|null|object|array<.+>)$/;

interface TypePickerProps {
  value: TypeString;
  onChange: (next: TypeString) => void;
  id?: string;
}

const TypePicker = ({ value, onChange, id }: TypePickerProps) => {
  // Whenever value isn't one of the presets, surface a text input below.
  const isPreset = COMMON_TYPES.some((t) => t.value === value);
  const [customMode, setCustomMode] = useState(!isPreset);
  const [customText, setCustomText] = useState(isPreset ? '' : value);
  const [customError, setCustomError] = useState<string | null>(null);

  return (
    <div className='flex flex-col gap-1'>
      <Select
        value={customMode ? CUSTOM_TYPE_SENTINEL : value}
        onValueChange={(v) => {
          if (v === CUSTOM_TYPE_SENTINEL) {
            setCustomMode(true);
            return;
          }
          setCustomMode(false);
          setCustomError(null);
          onChange(v as TypeString);
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              <span className='font-mono text-sm'>{t.label}</span>
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_TYPE_SENTINEL}>
            <span className='text-sm'>Custom…</span>
          </SelectItem>
        </SelectContent>
      </Select>
      {customMode && (
        <div>
          <Input
            value={customText}
            placeholder='array<array<int>>'
            className='font-mono text-sm'
            onChange={(e) => {
              setCustomText(e.target.value);
              if (customError) setCustomError(null);
            }}
            onBlur={() => {
              const trimmed = customText.trim();
              if (!TYPE_REGEX.test(trimmed)) {
                setCustomError('Invalid type');
                return;
              }
              onChange(trimmed as TypeString);
            }}
            hasError={!!customError}
          />
          {customError && <p className='text-xs text-red-600 mt-0.5'>{customError}</p>}
        </div>
      )}
    </div>
  );
};

interface SignatureEditorProps {
  signature: Signature;
  onChange: (next: Signature) => void;
  starterOverrides: Partial<Record<FunctionModeLanguage, string>>;
  onStarterOverridesChange: (
    next: Partial<Record<FunctionModeLanguage, string>>
  ) => void;
}

export const SignatureEditor = ({
  signature,
  onChange,
  starterOverrides,
  onStarterOverridesChange,
}: SignatureEditorProps) => {
  const [activeTab, setActiveTab] = useState<FunctionModeLanguage>('python');
  const [starterOpen, setStarterOpen] = useState(false);

  const overrideCount = FUNCTION_MODE_LANGUAGES.reduce(
    (n, lang) => (typeof starterOverrides[lang] === 'string' ? n + 1 : n),
    0
  );

  const updateParameter = (index: number, patch: Partial<Parameter>) => {
    const next = [...signature.parameters];
    next[index] = { ...next[index], ...patch };
    onChange({ ...signature, parameters: next });
  };

  const addParameter = () => {
    onChange({
      ...signature,
      parameters: [...signature.parameters, { name: '', type: 'int' }],
    });
  };

  const removeParameter = (index: number) => {
    onChange({
      ...signature,
      parameters: signature.parameters.filter((_, i) => i !== index),
    });
  };

  const setStarterOverride = (lang: FunctionModeLanguage, value: string) => {
    onStarterOverridesChange({ ...starterOverrides, [lang]: value });
  };

  const resetStarterOverride = (lang: FunctionModeLanguage) => {
    const next = { ...starterOverrides };
    delete next[lang];
    onStarterOverridesChange(next);
  };

  return (
    <div className='border border-gray-200 rounded-lg p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-gray-900'>Function signature</p>
        <span className='text-xs text-gray-500'>
          Defines the function the candidate implements.
        </span>
      </div>

      <div className='grid grid-cols-[1fr_auto] gap-3 items-end'>
        <div>
          <Label htmlFor='fn-name' className='block text-sm font-medium text-gray-700 mb-1.5'>
            Function name
          </Label>
          <Input
            id='fn-name'
            placeholder='twoSum'
            value={signature.functionName}
            onChange={(e) => onChange({ ...signature, functionName: e.target.value })}
            className='font-mono text-sm'
          />
        </div>
        <div className='w-44'>
          <Label htmlFor='fn-return' className='block text-sm font-medium text-gray-700 mb-1.5'>
            Returns
          </Label>
          <TypePicker
            id='fn-return'
            value={signature.returnType}
            onChange={(v) => onChange({ ...signature, returnType: v })}
          />
        </div>
      </div>

      <div>
        <div className='flex items-center justify-between mb-1.5'>
          <Label className='text-sm font-medium text-gray-700'>Parameters</Label>
          <Button
            type='button'
            variant='ghost'
            icon={RiAddLine}
            onClick={addParameter}
            className='text-xs'
          >
            Add parameter
          </Button>
        </div>
        {signature.parameters.length === 0 ? (
          <p className='text-xs text-gray-500 italic px-2 py-3 border border-dashed border-gray-200 rounded'>
            No parameters yet. Click "Add parameter" if your function takes any arguments.
          </p>
        ) : (
          <div className='space-y-2'>
            {signature.parameters.map((p, i) => (
              <div key={i} className='grid grid-cols-[1fr_180px_auto] gap-2 items-start'>
                <Input
                  placeholder='name'
                  value={p.name}
                  onChange={(e) => updateParameter(i, { name: e.target.value })}
                  className='font-mono text-sm'
                />
                <TypePicker value={p.type} onChange={(v) => updateParameter(i, { type: v })} />
                <Button
                  type='button'
                  variant='ghost'
                  className='p-1 text-red-500 hover:text-red-600'
                  onClick={() => removeParameter(i)}
                  icon={RiDeleteBinLine}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Starter code overrides — nested collapsible, closed by default.
          Most authors never touch this; auto-generated defaults are usually
          fine. Surfaces an "Overrides" pill next to the chevron when there
          are any so authors notice they exist. */}
      <div className='border-t border-gray-100 pt-3'>
        <button
          type='button'
          className='w-full flex items-center justify-between gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer'
          onClick={() => setStarterOpen((v) => !v)}
        >
          <span className='flex items-center gap-2'>
            {starterOpen ? (
              <RiArrowDownSLine className='size-4 text-gray-400' />
            ) : (
              <RiArrowRightSLine className='size-4 text-gray-400' />
            )}
            Starter code overrides
            {overrideCount > 0 && (
              <span className='text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700'>
                {overrideCount} edited
              </span>
            )}
          </span>
          <span className='text-xs text-gray-500'>
            Auto-generated from the signature unless overridden.
          </span>
        </button>

        {starterOpen && (
          <div className='mt-3'>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FunctionModeLanguage)}>
              <TabsList variant='solid' className='w-full'>
                {FUNCTION_MODE_LANGUAGES.map((lang) => {
                  const hasOverride = typeof starterOverrides[lang] === 'string';
                  return (
                    <TabsTrigger key={lang} value={lang} className='flex-1'>
                      <span className='flex items-center gap-1.5'>
                        {FUNCTION_MODE_LANGUAGE_LABEL[lang]}
                        {hasOverride && (
                          <span className='inline-block size-1.5 rounded-full bg-blue-500' />
                        )}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <StarterTabBody
              key={activeTab}
              signature={signature}
              language={activeTab}
              override={starterOverrides[activeTab]}
              onChange={(v) => setStarterOverride(activeTab, v)}
              onReset={() => resetStarterOverride(activeTab)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface StarterTabBodyProps {
  signature: Signature;
  language: FunctionModeLanguage;
  override: string | undefined;
  onChange: (value: string) => void;
  onReset: () => void;
}

const StarterTabBody = ({
  signature,
  language,
  override,
  onChange,
  onReset,
}: StarterTabBodyProps) => {
  const effectiveDefault = buildStarterForLanguage(signature, language);
  const hasOverride = typeof override === 'string';
  const displayed = hasOverride ? override : effectiveDefault;
  const stale = hasOverride && overrideLooksStale(signature, override);

  return (
    <div className='mt-3 space-y-2'>
      {stale && (
        <div className='flex items-start gap-2 px-3 py-2 rounded border border-amber-200 bg-amber-50 text-sm text-amber-800'>
          <RiAlertLine className='size-4 mt-0.5 shrink-0' />
          <span>
            This override references a function name or parameter that no longer exists. Reset to
            default or update it manually.
          </span>
        </div>
      )}
      <Textarea
        value={displayed}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className='font-mono text-sm'
        placeholder={effectiveDefault}
      />
      <div className='flex items-center justify-between'>
        <span className='text-xs text-gray-500'>
          {hasOverride ? (
            <Badge variant='neutral'>Edited</Badge>
          ) : (
            <Badge variant='neutral'>Default</Badge>
          )}
        </span>
        {hasOverride && (
          <Button
            type='button'
            variant='ghost'
            icon={RiResetLeftLine}
            onClick={onReset}
            className='text-xs'
          >
            Reset to default
          </Button>
        )}
      </div>
    </div>
  );
};
