import { RiArrowRightLine, RiQuestionMark, RiUploadLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadLogo } from '@/query/asset.query';
import { useCreateOrganization } from '@/query/org.query';

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOrgDialog = (props: CreateOrgDialogProps) => {
  const { open, onOpenChange } = props;
  const { createOrganization, isLoading } = useCreateOrganization();
  const { uploadLogo, isLoading: isUploadingLogo } = useUploadLogo();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [namePreview, setNamePreview] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      logo: '',
    },
    onSubmit: async ({ value }) => {
      await createOrganization(value);
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
          {/* Logo upload */}
          <form.Field name='logo'>
            {(_) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>Logo</Label>
                <div className='flex items-center gap-4 mb-2'>
                  <div className='h-20 w-20 shrink-0 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden bg-white'>
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
                      onClick={() => document.getElementById('dialog-logo-file')?.click()}
                      isLoading={isUploadingLogo}
                      icon={RiUploadLine}
                    >
                      Upload image
                    </Button>
                    <input
                      type='file'
                      id='dialog-logo-file'
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
