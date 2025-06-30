import { useForm } from '@tanstack/react-form';
import { useActiveOrg, useUpdateOrganization } from '@/query/org.query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RiSaveLine, RiImageLine } from '@remixicon/react';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { useState } from 'react';

export const SettingsView = () => {
  const { org, isLoading: isOrgLoading } = useActiveOrg();
  const { updateOrganization, isLoading: isUpdatingOrg } =
    useUpdateOrganization();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    org?.logo || null
  );

  const form = useForm({
    defaultValues: {
      name: org?.name ?? '',
      logo: org?.logo ?? '',
    },
    onSubmit: async ({ value }) => {
      // only update the logo if it has changed
      await updateOrganization({
        name: value.name,
        logo:
          value.logo === org?.logo || value.logo === ''
            ? undefined
            : value.logo,
      });
    },
  });

  const handleLogoFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        form.setFieldValue('logo', result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
      form.setFieldValue('logo', '');
    }
  };

  if (isOrgLoading) {
    return (
      <div className='min-h-screen flex flex-col gap-4 p-4 max-w-lg'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-1/3'></div>
          <div className='h-4 bg-gray-200 rounded w-2/3'></div>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
            <div className='space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col gap-4 p-4 max-w-lg'>
      <div>
        <SmallHeader>Organization Settings</SmallHeader>
        <MutedText>Manage your organization details and branding</MutedText>
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          <form.Field name='logo'>
            {(field) => (
              <div className='space-y-2'>
                <label
                  htmlFor={field.name}
                  className='text-sm font-medium text-gray-700'
                >
                  Organization Logo
                </label>
                <div className='space-y-3'>
                  {/* Logo Preview */}
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-12 w-12 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-300 transition-colors'
                      onClick={() =>
                        document.getElementById('logo-file')?.click()
                      }
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt='Organization logo'
                          className='h-full w-full object-cover'
                          onError={() => setLogoPreview(null)}
                        />
                      ) : (
                        <RiImageLine className='h-6 w-6 text-gray-400' />
                      )}
                    </div>
                  </div>

                  <input
                    type='file'
                    id='logo-file'
                    accept='image/*'
                    max={2 * 1024 * 1024}
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleLogoFileChange(file);
                    }}
                  />

                  <p className='text-xs text-gray-400'>
                    Recommended: Square image format. Supported formats: PNG,
                    JPG. Maximum file size: 2MB.
                  </p>
                </div>
              </div>
            )}
          </form.Field>

          <form.Field
            name='name'
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Organization name is required';
                if (value.length > 100)
                  return 'Organization name must be less than 100 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
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
                  hasError={!field.state.meta.isValid}
                />
                {field.state.meta.errors && (
                  <p className='text-sm text-red-600'>
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <div className='flex justify-end mt-4'>
            <Button
              type='submit'
              icon={RiSaveLine}
              iconPosition='right'
              isLoading={isUpdatingOrg}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
