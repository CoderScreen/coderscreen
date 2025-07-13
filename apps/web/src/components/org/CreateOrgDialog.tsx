import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@tanstack/react-form';
import { useCreateOrganization } from '@/query/org.query';
import { slugify } from '@/lib/slug';
import { RiArrowRightLine } from '@remixicon/react';

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateOrgDialog = (props: CreateOrgDialogProps) => {
  const { open, onOpenChange, onSuccess } = props;
  const { createOrganization, isLoading } = useCreateOrganization();

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
    },
    onSubmit: async ({ value }) => {
      // Generate slug from organization name if not provided
      const finalSlug = value.slug || slugify(value.name);

      await createOrganization({
        name: value.name,
        slug: finalSlug,
      });

      onSuccess?.();
      onOpenChange(false);
    },
  });

  const handleNameChange = (name: string) => {
    form.setFieldValue('name', name);
    form.setFieldValue('slug', slugify(name));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          {/* Organization Name */}
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Organization name is required';
                if (value.length > 100) return 'Organization name must be less than 100 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  placeholder='Enter your organization name'
                  value={field.state.value}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                  }}
                  onBlur={field.handleBlur}
                  hasError={!field.state.meta.isValid}
                  className='mb-1'
                />
                {field.state.meta.errors && (
                  <p className='text-sm text-red-600'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Organization Slug */}
          <form.Field
            name='slug'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Organization slug is required';
                if (value.length > 50) return 'Organization slug must be less than 50 characters';
                if (!/^[a-z0-9-]+$/.test(value))
                  return 'Slug can only contain lowercase letters, numbers, and hyphens';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Slug
                </label>
                <Input
                  id={field.name}
                  placeholder='your-organization-slug'
                  value={field.state.value}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    field.handleChange(slug);
                  }}
                  onBlur={field.handleBlur}
                  hasError={!field.state.meta.isValid}
                  className='mb-1'
                />
                <p className='text-xs text-gray-500'>This will be used in your organization URL</p>
                {field.state.meta.errors && (
                  <p className='text-sm text-red-600'>{field.state.meta.errors.join(', ')}</p>
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
              Create Organization
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
