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
import { RiArrowRightLine, RiQuestionMark, RiUploadLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useUploadLogo } from '@/query/asset.query';
import { useCreateOrganization } from '@/query/org.query';

interface OrgOnboardingProps {
  onComplete: () => void;
}

const CODERSCREEN_GOALS: string[] = [
  'Conduct live technical interviews',
  'Screen candidates with coding challenges',
  'Assign and manage take-home projects',
  'Streamline the entire interview process',
  'Just exploring',
];

export const OrgOnboarding = (props: OrgOnboardingProps) => {
  const { onComplete } = props;

  const { createOrganization, isLoading } = useCreateOrganization();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [namePreview, setNamePreview] = useState<string | null>(null);

  const { uploadLogo, isLoading: isUploadingLogo } = useUploadLogo();

  const form = useForm({
    defaultValues: {
      name: '',
      goal: '',
      logo: '',
    },
    onSubmit: async ({ value }) => {
      await createOrganization(value);
      onComplete();
    },
  });

  const handleLogoFileChange = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);

        const asset = await uploadLogo(result);
        form.setFieldValue('logo', asset.url);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
      form.setFieldValue('logo', '');
    }
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center py-12 px-4'>
      <div className='w-full max-w-xl'>
        {/* Heading */}
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Let's set up your organization</h1>
        {/* Subheading */}
        <p className='text-gray-500 mb-8 max-w-lg'>
          Tell us more about your organization so we can provide you a personalized experience
          tailored to your needs and preferences.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-8'
        >
          {/* Logo upload */}
          <form.Field name='logo'>
            {(_) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>Logo</Label>
                <div className='flex items-center gap-4 mb-2'>
                  <div className='h-20 w-20 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-white'>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt='Organization logo'
                        className='h-full w-full object-cover'
                        onError={() => setLogoPreview(null)}
                      />
                    ) : (
                      <div className='h-full w-full flex items-center justify-center bg-primary'>
                        {namePreview ? (
                          <span className='text-white text-3xl'>{namePreview.slice(0, 2)}</span>
                        ) : (
                          <RiQuestionMark className='h-10 w-10 text-white' />
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      type='button'
                      variant='secondary'
                      className='mb-1'
                      onClick={() => document.getElementById('logo-file')?.click()}
                      isLoading={isUploadingLogo}
                      icon={RiUploadLine}
                    >
                      Upload image
                    </Button>
                    <input
                      type='file'
                      id='logo-file'
                      accept='image/*'
                      max={8 * 1024 * 1024}
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleLogoFileChange(file);
                      }}
                    />
                    <div className='text-xs text-gray-400'>
                      .png, .jpeg, .svg files up to 2MB. Recommended size is 256x256px.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form.Field>

          {/* Organization Name */}
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Workspace name is required';
                if (value.length > 100) return 'Workspace name must be less than 100 characters';
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
                    field.handleChange(e.target.value);
                    const trimmed = e.target.value.toUpperCase().trim();
                    setNamePreview(trimmed);
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

          {/* Primary Goal */}
          <form.Field
            name='goal'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Please select your primary goal';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>
                  What's your main goal with CoderScreen?
                </Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger hasError={!field.state.meta.isValid} className='mb-1'>
                    <SelectValue placeholder='Select your primary goal' />
                  </SelectTrigger>
                  <SelectContent>
                    {CODERSCREEN_GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{goal}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className='text-sm text-red-600'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className='pt-2'>
            <Button
              type='submit'
              className='w-full'
              isLoading={isLoading}
              icon={RiArrowRightLine}
              iconPosition='right'
            >
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
