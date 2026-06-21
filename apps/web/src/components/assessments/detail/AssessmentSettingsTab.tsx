import type { AssessmentSchema } from '@coderscreen/api/schema/assessment';
import { Button } from '@coderscreen/ui/button';
import { Divider } from '@coderscreen/ui/divider';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { MutedText } from '@coderscreen/ui/typography';
import { RiDeleteBinLine, RiSaveLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { ASSESSMENT_LANGUAGES } from '@/lib/languages';
import { useDeleteAssessment, useUpdateAssessment } from '@/query/assessment.query';

function timeLimitToPreset(timeLimitSeconds: number | null): string {
  if (timeLimitSeconds === null) return 'none';
  const minutes = Math.floor(timeLimitSeconds / 60);
  if (minutes === 30 || minutes === 60 || minutes === 90) return String(minutes);
  return 'custom';
}

function timeLimitToCustomMinutes(timeLimitSeconds: number | null): string {
  if (timeLimitSeconds === null) return '';
  const minutes = Math.floor(timeLimitSeconds / 60);
  if (minutes === 30 || minutes === 60 || minutes === 90) return '';
  return String(minutes);
}

interface AssessmentSettingsTabProps {
  assessment: AssessmentSchema;
}

export const AssessmentSettingsTab = ({ assessment }: AssessmentSettingsTabProps) => {
  const { updateAssessment, isLoading } = useUpdateAssessment();
  const { deleteAssessment, isLoading: isDeleting } = useDeleteAssessment();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: assessment.title,
      allowedLanguages: assessment.allowedLanguages as string[],
      timeLimitPreset: timeLimitToPreset(assessment.timeLimitSeconds),
      customMinutes: timeLimitToCustomMinutes(assessment.timeLimitSeconds),
    },
    onSubmit: async ({ value }) => {
      let timeLimitSeconds: number | null = null;
      if (value.timeLimitPreset === 'custom') {
        timeLimitSeconds = value.customMinutes ? Number(value.customMinutes) * 60 : null;
      } else if (value.timeLimitPreset !== 'none') {
        timeLimitSeconds = Number(value.timeLimitPreset) * 60;
      }

      await updateAssessment({
        id: assessment.id,
        data: {
          title: value.title,
          allowedLanguages: value.allowedLanguages as (typeof ASSESSMENT_LANGUAGES)[number][],
          timeLimitSeconds,
        },
      });
    },
  });

  return (
    <div className='py-6 max-w-2xl'>
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
              <Label htmlFor={field.name} className='block text-sm font-medium text-gray-700 mb-2'>
                Title
              </Label>
              <Input
                id={field.name}
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

        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => (
            <Button type='submit' isLoading={isLoading} icon={RiSaveLine} disabled={!isDirty}>
              Save Changes
            </Button>
          )}
        </form.Subscribe>
      </form>

      {/* Danger Zone */}
      <Divider />

      <div>
        <SmallHeader>Danger Zone</SmallHeader>
        <MutedText>
          Permanently delete this assessment and all its questions, test cases, and submissions.
        </MutedText>
        <div className='mt-4'>
          <Button
            variant='destructive'
            icon={RiDeleteBinLine}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Assessment
          </Button>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await deleteAssessment(assessment.id);
          setDeleteDialogOpen(false);
          router.navigate({ to: '/assessments' });
        }}
        title='Delete Assessment'
        description='Are you sure you want to delete this assessment? This action cannot be undone. All questions, test cases, and submissions will be permanently removed.'
        isLoading={isDeleting}
      />
    </div>
  );
};
