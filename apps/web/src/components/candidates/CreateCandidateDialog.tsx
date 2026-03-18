import { Button } from '@coderscreen/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import { RiArrowRightLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useCreateCandidate } from '@/query/assessment.query';

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCandidateDialog = ({ open, onOpenChange }: CreateCandidateDialogProps) => {
  const { createCandidate, isLoading } = useCreateCandidate();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      await createCandidate(value);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Name is required';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className='block text-sm font-medium text-gray-700 mb-2'>
                  Name
                </Label>
                <Input
                  id={field.name}
                  placeholder='John Doe'
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

          <form.Field
            name='email'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </Label>
                <Input
                  id={field.name}
                  type='email'
                  placeholder='john@example.com'
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
              Add Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
