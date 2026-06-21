import { Button } from '@coderscreen/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { RiArrowRightLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { ASSESSMENT_LANGUAGES } from '@/lib/languages';
import { useCreateAssessment } from '@/query/assessment.query';

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAssessmentDialog = ({ open, onOpenChange }: CreateAssessmentDialogProps) => {
  const { createAssessment, isLoading } = useCreateAssessment();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: '',
      allowedLanguages: [...ASSESSMENT_LANGUAGES] as string[],
      timeLimitPreset: '60' as string,
      customMinutes: '',
    },
    onSubmit: async ({ value }) => {
      let timeLimitSeconds: number | null = null;
      if (value.timeLimitPreset === 'custom') {
        timeLimitSeconds = value.customMinutes ? Number(value.customMinutes) * 60 : null;
      } else if (value.timeLimitPreset !== 'none') {
        timeLimitSeconds = Number(value.timeLimitPreset) * 60;
      }

      const result = await createAssessment({
        title: value.title,
        description: '',
        mode: 'independent',
        allowedLanguages: value.allowedLanguages as (typeof ASSESSMENT_LANGUAGES)[number][],
        timeLimitSeconds,
      });
      onOpenChange(false);
      router.navigate({
        to: '/assessments/$assessmentId',
        params: { assessmentId: result.id },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Assessment</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          {/* Title */}
          <form.Field
            name='title'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Title is required';
                if (value.length > 200) return 'Title must be less than 200 characters';
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
                  Title
                </Label>
                <Input
                  id={field.name}
                  placeholder='e.g., Backend Engineering Assessment'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  hasError={!field.state.meta.isValid}
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className='text-sm text-red-600 mt-1'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Time Limit */}
          <form.Field name='timeLimitPreset'>
            {(field) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>Time Limit</Label>
                <Select value={field.state.value} onValueChange={(val) => field.handleChange(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='30'>30 minutes</SelectItem>
                    <SelectItem value='60'>60 minutes</SelectItem>
                    <SelectItem value='90'>90 minutes</SelectItem>
                    <SelectItem value='custom'>Custom</SelectItem>
                    <SelectItem value='none'>No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {/* Custom Time Input */}
          <form.Field name='timeLimitPreset'>
            {(presetField) =>
              presetField.state.value === 'custom' ? (
                <form.Field name='customMinutes'>
                  {(field) => (
                    <div>
                      <Label
                        htmlFor={field.name}
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Custom Time (minutes)
                      </Label>
                      <Input
                        id={field.name}
                        type='number'
                        placeholder='Enter minutes'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        min={1}
                      />
                    </div>
                  )}
                </form.Field>
              ) : null
            }
          </form.Field>

          {/* Allowed Languages */}
          <form.Field
            name='allowedLanguages'
            validators={{
              onChange: ({ value }: { value: string[] }) => {
                if (!value || value.length === 0) return 'Select at least one language';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>
                  Allowed Languages
                </Label>
                <LanguageSelector
                  value={field.state.value}
                  onChange={(langs) => field.handleChange(langs)}
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className='text-sm text-red-600 mt-1'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
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
              Create Assessment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
