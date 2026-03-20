import { Button } from '@coderscreen/ui/button';
import { Checkbox } from '@coderscreen/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { Textarea } from '@coderscreen/ui/textarea';
import { RiArrowRightLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import type { TestCaseCallbacks } from './TestCasesList';

interface TestCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbacks: TestCaseCallbacks;
  mode: 'create' | 'edit';
  testCase?: {
    id: string;
    label: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    position: number;
  };
  nextPosition?: number;
}

export const TestCaseDialog = ({
  open,
  onOpenChange,
  callbacks,
  mode,
  testCase,
  nextPosition = 0,
}: TestCaseDialogProps) => {
  const isLoading = (callbacks.isCreating || callbacks.isUpdating) ?? false;

  const form = useForm({
    defaultValues: {
      label: mode === 'edit' && testCase ? testCase.label : '',
      input: mode === 'edit' && testCase ? testCase.input : '',
      expectedOutput: mode === 'edit' && testCase ? testCase.expectedOutput : '',
      isHidden: mode === 'edit' && testCase ? testCase.isHidden : false,
    },
    onSubmit: async ({ value }) => {
      if (mode === 'create') {
        await callbacks.createTestCase({
          label: value.label,
          input: value.input,
          expectedOutput: value.expectedOutput,
          isHidden: value.isHidden,
          position: nextPosition,
        });
      } else if (testCase) {
        await callbacks.updateTestCase({
          testCaseId: testCase.id,
          data: {
            label: value.label,
            input: value.input,
            expectedOutput: value.expectedOutput,
            isHidden: value.isHidden,
          },
        });
      }

      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Test Case' : 'Edit Test Case'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-4'
        >
          {/* Label */}
          <form.Field name='label'>
            {(field) => (
              <div>
                <Label
                  htmlFor={field.name}
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Label
                </Label>
                <Input
                  id={field.name}
                  placeholder='e.g., Basic case'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          {/* Input */}
          <form.Field
            name='input'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (value === undefined || value === null) return 'Input is required';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label
                  htmlFor={field.name}
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Input (stdin)
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder='Input that will be piped to stdin...'
                  rows={3}
                  className='font-mono text-sm'
                  hasError={!field.state.meta.isValid}
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className='text-sm text-red-600 mt-1'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Expected Output */}
          <form.Field
            name='expectedOutput'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Expected output is required';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label
                  htmlFor={field.name}
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Expected Output (stdout)
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder='Expected stdout output...'
                  rows={3}
                  className='font-mono text-sm'
                  hasError={!field.state.meta.isValid}
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className='text-sm text-red-600 mt-1'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Is Hidden */}
          <form.Field name='isHidden'>
            {(field) => (
              <label htmlFor={field.name} className='flex items-center gap-2 cursor-pointer'>
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <span className='text-sm'>Hidden (not shown to candidates)</span>
              </label>
            )}
          </form.Field>

          <div className='flex justify-end gap-3 pt-4'>
            <Button type='button' variant='secondary' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              isLoading={isLoading}
              icon={RiArrowRightLine}
              iconPosition='right'
            >
              {mode === 'create' ? 'Add Test Case' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
