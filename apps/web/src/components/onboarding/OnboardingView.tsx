import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  RiBuilding2Line,
  RiArrowRightLine,
  RiCheckLine,
} from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useCreateOrganization } from '@/query/org.query';

export const OnboardingView = () => {
  const { createOrganization, isLoading } = useCreateOrganization();

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await createOrganization(value);
    },
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
            <RiBuilding2Line className='w-8 h-8 text-blue-600' />
          </div>
          <CardTitle className='text-2xl font-semibold text-gray-900'>
            Create Your Organization
          </CardTitle>
          <CardDescription className='text-gray-600'>
            Set up your organization to get started with CoderScreen
          </CardDescription>
        </CardHeader>

        <CardContent>
            <form.Field
              name='name'
              validators={{
                onChange: ({ value }: { value: string }) => {
                  if (!value) return 'Organization name is required';
                  if (value.length > 100)
                    return 'Organization name must be less than 100 characters';
                  return undefined;
                },
              }}
            >
              {(field: any) => (
                <div className='space-y-2'>
                  <label
                    htmlFor={field.name}
                    className='text-sm font-medium text-gray-700'
                  >
                    Organization Name
                  </label>
                  <Input
                    id={field.name}
                    placeholder='Enter your organization name'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    hasError={!!field.state.meta.errors}
                  />
                  {field.state.meta.errors && (
                    <p className='text-sm text-red-600'>
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name='slug'
              validators={{
                onChange: ({ value }: { value: string }) => {
                  if (!value) return 'Organization slug is required';
                  if (value.length > 50)
                    return 'Organization slug must be less than 50 characters';
                  if (!/^[a-z0-9-]+$/.test(value)) {
                    return 'Organization slug can only contain lowercase letters, numbers, and hyphens';
                  }
                  return undefined;
                },
              }}
            >
              {(field: any) => (
                <div className='space-y-2'>
                  <label
                    htmlFor={field.name}
                    className='text-sm font-medium text-gray-700'
                  >
                    Organization Slug
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 text-sm'>
                        app.coderscreen.com/
                      </span>
                    </div>
                    <Input
                      id={field.name}
                      placeholder='your-organization'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      hasError={!!field.state.meta.errors}
                      className='pl-48'
                    />
                  </div>
                  {field.state.meta.errors && (
                    <p className='text-sm text-red-600'>
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                  <p className='text-xs text-gray-500'>
                    This will be used in your organization URL
                  </p>
                </div>
              )}
            </form.Field>

          <Button
            type='submit'
            className='w-full'
            isLoading={isLoading}
            icon={RiArrowRightLine}
            iconPosition='right'
            onClick={form.handleSubmit}
          >
            Create Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
