import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Divider } from '@coderscreen/ui/divider';
import { SmallHeader } from '@coderscreen/ui/heading';
import { Input } from '@coderscreen/ui/input';
import { MutedText } from '@coderscreen/ui/typography';
import { RiCloseLine, RiDeleteBinLine, RiLogoutBoxLine, RiSaveLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useSession, useSignOut } from '@/query/auth.query';
import { useDeleteUser, useUpdateUser } from '@/query/profile.query';

export const ProfileView = () => {
  const { user } = useSession();
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser();
  const { deleteUser, isLoading: isDeletingUser } = useDeleteUser();
  const { signOut, isLoading: isSigningOut } = useSignOut();

  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
    },
    onSubmit: async ({ value }) => {
      await updateUser(value);
    },
  });

  const handleDeleteAccount = async () => {
    await deleteUser();
  };

  return (
    <div className='min-h-screen flex flex-col p-4 max-w-4xl'>
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
                if (value.length > 100) return 'Name must be less than 100 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className='space-y-2'>
                <label htmlFor={field.name} className='text-sm font-medium text-gray-700'>
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
                  <p className='text-sm text-red-600'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-gray-700'>
              Email
            </label>
            <Input id='email' placeholder='Enter your email' value={user?.email} disabled />
          </div>

          <div className='flex justify-end mt-4'>
            <Button type='submit' icon={RiSaveLine} iconPosition='right' isLoading={isUpdatingUser}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <Divider />

      <div>
        <SmallHeader>Logout</SmallHeader>
        <MutedText>Logout of your account</MutedText>

        <div className='flex justify-end mt-4'>
          <Button
            variant='secondary'
            icon={RiLogoutBoxLine}
            iconPosition='right'
            onClick={() => signOut()}
            isLoading={isSigningOut}
          >
            Logout
          </Button>
        </div>
      </div>

      <Divider />

      <div>
        <SmallHeader>Delete Account</SmallHeader>
        <MutedText>Delete your account and all your data</MutedText>

        <div className='flex justify-end mt-4'>
          <Button
            variant='destructive'
            icon={RiDeleteBinLine}
            iconPosition='right'
            onClick={() => setOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogDescription>
          <DialogFooter className='flex justify-end mt-4'>
            <Button variant='secondary' icon={RiCloseLine} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              icon={RiDeleteBinLine}
              iconPosition='right'
              onClick={handleDeleteAccount}
              isLoading={isDeletingUser}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
