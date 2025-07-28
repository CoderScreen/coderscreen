import { RiArrowRightLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/query/auth.query';
import { useUpdateUser } from '@/query/profile.query';

const ROLE_OPTIONS = ['Founder', 'Developer', 'Recruiter', 'Hiring Manager', 'Student', 'Other'];

interface UserOnboardingProps {
  onComplete: () => void;
}

export const UserOnboarding = (props: UserOnboardingProps) => {
  const { onComplete } = props;

  const { user } = useSession();
  const { updateUser, isLoading } = useUpdateUser({
    hideSuccessMessage: true,
  });

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      persona: '',
    },
    onSubmit: async ({ value }) => {
      // Update user name
      await updateUser(value);

      onComplete();
    },
  });

  return (
    <div className='min-h-screen flex flex-col justify-center items-center py-12 px-4'>
      <div className='w-full max-w-xl'>
        {/* Heading */}
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome to CoderScreen</h1>
        {/* Subheading */}
        <p className='text-gray-500 mb-8 max-w-lg'>
          Let's get to know you better so we can provide you with a personalized experience tailored
          to your needs.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-8'
        >
          {/* Name Field */}
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Name is required';
                if (value.length > 100) return 'Name must be less than 100 characters';
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
                  Your Name
                </label>
                <Input
                  id={field.name}
                  placeholder='Enter your full name'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          {/* Role Selection */}
          <form.Field
            name='persona'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value) return 'Please select your role';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-2'>
                  What best describes you?
                </Label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger hasError={!field.state.meta.isValid} className='mb-1'>
                    <SelectValue placeholder='Select your role' />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => {
                      return (
                        <SelectItem key={role} value={role}>
                          <div className='flex items-center gap-3'>
                            <div className='flex flex-col'>
                              <span className='font-medium'>{role}</span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
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
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
