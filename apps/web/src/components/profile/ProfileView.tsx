import { useForm } from '@tanstack/react-form';
import { useSession } from '@/query/auth.query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RiSaveLine } from '@remixicon/react';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { useUpdateUser } from '@/query/profile.query';

export const ProfileView = () => {
  const { user } = useSession();
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser();

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
    },
    onSubmit: async ({ value }) => {
      await updateUser(value);
    },
  });

  return (
    <div className='min-h-screen flex flex-col gap-4 p-4 max-w-lg'>
      <div>
        <SmallHeader>Account Settings</SmallHeader>
        <MutedText>Manage your account details and default settings</MutedText>
      </div>
      <div>
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
              onChange: ({ value }) => {
                if (!value) return 'Name is required';
                if (value.length > 100)
                  return 'Name must be less than 100 characters';
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
                  Your Name
                </label>
                <Input
                  id={field.name}
                  placeholder='Enter your name'
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

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Email</label>
            <Input
              id='email'
              placeholder='Enter your email'
              value={user?.email}
              disabled
            />
          </div>

          {/* <div className='pt-2'>
            <div className='mb-2 text-base font-semibold text-gray-900'>
              Workspaces
            </div>
            <div className='mb-1 text-sm text-gray-600'>
              Manage your default workspace
            </div>
            <form.Field name='workspace'>
              {(field: any) => (
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={isOrgsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a workspace' />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs?.map((org: any) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          </div> */}

          <Button
            type='submit'
            className='w-full mt-4'
            icon={RiSaveLine}
            iconPosition='right'
            isLoading={isUpdatingUser}
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};
