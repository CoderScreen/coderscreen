import { type TypeString, validateValue } from '@coderscreen/common/types';
import { Input } from '@coderscreen/ui/input';
import { Switch } from '@coderscreen/ui/switch';
import { Textarea } from '@coderscreen/ui/textarea';
import { useEffect, useState } from 'react';

interface TypedValueEditorProps {
  type: TypeString;
  value: unknown;
  onChange: (value: unknown) => void;
  // Caller-provided id for label association.
  id?: string;
  placeholder?: string;
  // True after the parent's first submit attempt — used so we don't shout
  // "required" before the author has had a chance to type.
  showErrors?: boolean;
}

const isScalarType = (t: TypeString): boolean =>
  t === 'int' || t === 'float' || t === 'string' || t === 'bool' || t === 'null';

const isComplexType = (t: TypeString): boolean => !isScalarType(t);

/**
 * Edits a single JSON-shaped value typed against a declared `TypeString`.
 *
 * - Scalar types (int/float/string/bool/null) render the right native input.
 * - Compound types (object, array<T>, nested) render a JSON literal textarea
 *   with on-blur validation. The author types valid JSON; we parse + validate
 *   against the declared type and surface a single error line on failure.
 *
 * The component holds a local "draft" string for compound inputs so the
 * caller's `value` only updates when the draft parses successfully.
 */
export const TypedValueEditor = ({
  type,
  value,
  onChange,
  id,
  placeholder,
  showErrors,
}: TypedValueEditorProps) => {
  // For scalar inputs, drive directly from value. For compound inputs, keep
  // a draft string so typing invalid JSON doesn't blow away the upstream value
  // until we successfully parse on blur.
  const [draft, setDraft] = useState(() => formatForDraft(value, type));
  const [parseError, setParseError] = useState<string | null>(null);

  // Sync the draft when the upstream value changes outside this editor
  // (e.g. parent reset). Skip when complex and we're already showing an error,
  // so we don't trample the user's mid-edit text.
  // biome-ignore lint/correctness/useExhaustiveDependencies: compare value by content (JSON), not reference, so a new-but-equal value object on parent re-render doesn't reset the draft mid-edit.
  useEffect(() => {
    if (isComplexType(type)) {
      setDraft(formatForDraft(value, type));
    }
  }, [JSON.stringify(value), type]);

  if (type === 'bool') {
    const checked = value === true;
    return <Switch id={id} checked={checked} onCheckedChange={(c) => onChange(!!c)} />;
  }

  if (type === 'null') {
    // Nothing to edit — the only valid value is null. Render a disabled hint.
    return <Input id={id} value='null' disabled className='font-mono text-sm' />;
  }

  if (type === 'int' || type === 'float') {
    return (
      <Input
        id={id}
        type='number'
        step={type === 'float' ? 'any' : 1}
        value={typeof value === 'number' ? value : ''}
        placeholder={placeholder ?? (type === 'int' ? '0' : '0.0')}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            onChange(null);
            return;
          }
          const n = type === 'int' ? parseInt(raw, 10) : parseFloat(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
        className='font-mono text-sm'
      />
    );
  }

  if (type === 'string') {
    return (
      <Input
        id={id}
        value={typeof value === 'string' ? value : ''}
        placeholder={placeholder ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className='font-mono text-sm'
      />
    );
  }

  // Compound: array<T>, object, or anything we haven't special-cased.
  const handleBlur = () => {
    if (draft.trim() === '') {
      setParseError('Required');
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch (err) {
      setParseError(
        `Invalid JSON: ${err instanceof Error ? err.message.split('\n')[0] : 'parse error'}`
      );
      return;
    }
    const v = validateValue(parsed, type);
    if (!v.ok) {
      setParseError(v.reason);
      return;
    }
    setParseError(null);
    onChange(parsed);
  };

  const showError = parseError && (showErrors || draft.length > 0);

  return (
    <div>
      <Textarea
        id={id}
        value={draft}
        placeholder={placeholder ?? jsonPlaceholder(type)}
        onChange={(e) => {
          setDraft(e.target.value);
          // Optimistically clear the error while typing.
          if (parseError) setParseError(null);
        }}
        onBlur={handleBlur}
        rows={3}
        className='font-mono text-sm'
        hasError={!!showError}
      />
      {showError && <p className='text-xs text-red-600 mt-1'>{parseError}</p>}
    </div>
  );
};

const formatForDraft = (value: unknown, type: TypeString): string => {
  if (value === undefined) return type === 'object' ? '{}' : type.startsWith('array<') ? '[]' : '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
};

const jsonPlaceholder = (type: TypeString): string => {
  if (type === 'object') return '{ "key": "value" }';
  if (type.startsWith('array<int>')) return '[1, 2, 3]';
  if (type.startsWith('array<string>')) return '["a", "b"]';
  if (type.startsWith('array<')) return '[ ... ]';
  return '';
};
