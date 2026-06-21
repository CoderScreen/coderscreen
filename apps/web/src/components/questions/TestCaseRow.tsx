import type { Parameter, TypeString } from '@coderscreen/common/types';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { Switch } from '@coderscreen/ui/switch';
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeOffLine,
  RiLock2Line,
} from '@remixicon/react';
import { useEffect, useState } from 'react';
import { TypedValueEditor } from '@/components/common/TypedValueEditor';

export interface TestCaseRowData {
  id: string;
  label: string;
  args: unknown[];
  expectedReturn: unknown;
  isHidden: boolean;
  position: number;
}

export interface TestCaseDraft {
  label: string;
  args: unknown[];
  expectedReturn: unknown;
  isHidden: boolean;
}

interface TestCaseRowProps {
  index: number;
  testCase: TestCaseRowData;
  signature: {
    functionName: string;
    parameters: Parameter[];
    returnType: TypeString;
  };
  isExpanded: boolean;
  isSaving: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onSave: (draft: TestCaseDraft) => Promise<void>;
  onDelete: () => Promise<void>;
}

/**
 * Renders one test case as either:
 *   - collapsed:  `1.  twoSum([2,7,11,15], 9) → [0,1]   [hidden]   ✎  🗑`
 *   - expanded:   inline form — TypedValueEditor per parameter + expected return + label + hidden, with Cancel / Save
 *
 * Save commits via the parent's onSave (which calls the appropriate
 * library/assessment mutation). Cancel collapses and discards the draft.
 */
export const TestCaseRow = ({
  index,
  testCase,
  signature,
  isExpanded,
  isSaving,
  onExpand,
  onCollapse,
  onSave,
  onDelete,
}: TestCaseRowProps) => {
  // Local draft state — only persists while expanded. Reset to the saved row's
  // values whenever the expansion (re)opens or the saved values change.
  const [draft, setDraft] = useState<TestCaseDraft>(() => ({
    label: testCase.label,
    args: testCase.args,
    expectedReturn: testCase.expectedReturn,
    isHidden: testCase.isHidden,
  }));

  useEffect(() => {
    if (isExpanded) {
      setDraft({
        label: testCase.label,
        args: testCase.args,
        expectedReturn: testCase.expectedReturn,
        isHidden: testCase.isHidden,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, testCase.args, testCase.expectedReturn, testCase.isHidden, testCase.label]);

  if (!isExpanded) {
    return (
      <CollapsedRow
        index={index}
        testCase={testCase}
        signature={signature}
        onExpand={onExpand}
        onDelete={onDelete}
      />
    );
  }

  const updateArg = (i: number, v: unknown) => {
    const next = [...draft.args];
    next[i] = v;
    setDraft({ ...draft, args: next });
  };

  const handleSave = async () => {
    await onSave(draft);
  };

  return (
    <div className='border border-gray-200 rounded-lg bg-white px-4 py-3 space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-mono text-gray-500'>Case {index + 1}</span>
        <Button
          type='button'
          variant='ghost'
          icon={RiCloseLine}
          onClick={onCollapse}
          className='p-1 text-xs'
        />
      </div>

      {signature.parameters.length === 0 ? (
        <div className='text-xs text-gray-500 italic'>
          This question takes no parameters — the function will be called with no arguments.
        </div>
      ) : (
        <div className='space-y-2'>
          {signature.parameters.map((p, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: parameters are a positional list indexed into draft.args[i]; index is the correct identity
            <div key={i}>
              <Label className='block text-xs font-mono text-gray-600 mb-1'>
                {p.name}: <span className='text-gray-400'>{p.type}</span>
              </Label>
              <TypedValueEditor
                type={p.type}
                value={draft.args[i]}
                onChange={(v) => updateArg(i, v)}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <Label className='block text-xs font-mono text-gray-600 mb-1'>
          returns <span className='text-gray-400'>{signature.returnType}</span>
        </Label>
        <TypedValueEditor
          type={signature.returnType}
          value={draft.expectedReturn}
          onChange={(v) => setDraft({ ...draft, expectedReturn: v })}
        />
      </div>

      <div className='grid grid-cols-[1fr_auto] gap-3 items-end'>
        <div>
          <Label className='block text-xs text-gray-600 mb-1'>
            Label <span className='text-gray-400'>(optional)</span>
          </Label>
          <Input
            placeholder='e.g., Handles empty array'
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            className='text-sm'
          />
        </div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: label wraps a Radix Switch (custom control biome can't detect as an input) */}
        <label className='flex items-center gap-2 px-3 py-2 rounded border border-gray-200 bg-white cursor-pointer'>
          <Switch
            checked={draft.isHidden}
            onCheckedChange={(c) => setDraft({ ...draft, isHidden: !!c })}
          />
          <span className='text-xs text-gray-700 flex items-center gap-1.5'>
            <RiEyeOffLine className='size-3.5' /> Hidden
          </span>
        </label>
      </div>

      <div className='flex justify-end gap-2 pt-1'>
        <Button type='button' variant='secondary' onClick={onCollapse}>
          Cancel
        </Button>
        <Button type='button' onClick={handleSave} isLoading={isSaving}>
          Save case
        </Button>
      </div>
    </div>
  );
};

const formatCall = (functionName: string, args: unknown[]): string => {
  if (!functionName) return '(unset signature)';
  const f = args.map((a) => JSON.stringify(a)).join(', ');
  return `${functionName}(${f})`;
};

const formatReturn = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const CollapsedRow = ({
  index,
  testCase,
  signature,
  onExpand,
  onDelete,
}: {
  index: number;
  testCase: TestCaseRowData;
  signature: { functionName: string };
  onExpand: () => void;
  onDelete: () => Promise<void>;
}) => {
  const call = formatCall(signature.functionName, testCase.args);
  const ret = formatReturn(testCase.expectedReturn);
  const summary = `${call} → ${ret}`;

  return (
    <div className='flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors group'>
      <button
        type='button'
        className='flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer'
        onClick={onExpand}
      >
        <span className='text-xs font-mono text-gray-400 w-6 shrink-0'>{index + 1}.</span>
        <span className='font-mono text-sm text-gray-900 truncate'>{summary}</span>
        {testCase.label && (
          <span className='text-xs text-gray-500 italic truncate hidden md:inline'>
            · {testCase.label}
          </span>
        )}
        {testCase.isHidden && (
          <Badge variant='warning' className='shrink-0'>
            <RiLock2Line className='size-3.5' /> Hidden
          </Badge>
        )}
      </button>
      <div className='flex items-center gap-1 shrink-0'>
        <Button
          type='button'
          variant='ghost'
          icon={RiEditLine}
          onClick={onExpand}
          className='p-1'
        />
        <Button
          type='button'
          variant='ghost'
          icon={RiDeleteBinLine}
          onClick={onDelete}
          className='p-1 text-red-500 hover:text-red-600'
        />
      </div>
    </div>
  );
};
