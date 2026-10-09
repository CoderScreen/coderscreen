import { Button } from '@coderscreen/ui/button';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  RemixiconComponentType,
  RiArrowRightLine,
  RiFileList3Line,
  RiTerminalBoxLine,
} from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { cx, focusRing } from '@/lib/utils';
import { useSession } from '@/query/auth.query';
import { useCreateOrganization } from '@/query/org.query';
import { useUpdateUser } from '@/query/profile.query';
import { useCreateRoom } from '@/query/room.query';

type OnboardingGoal = 'live_interviews' | 'assessments';

const GOALS: {
  value: OnboardingGoal;
  label: string;
  description: string;
  icon: RemixiconComponentType;
}[] = [
  {
    value: 'live_interviews',
    label: 'Live interviews',
    description: 'Code with a candidate in real time',
    icon: RiTerminalBoxLine,
  },
  {
    value: 'assessments',
    label: 'Coding assessments',
    description: 'Send a test that grades itself',
    icon: RiFileList3Line,
  },
];

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'hey.com',
  'gmx.com',
  'yandex.com',
  'mail.com',
  'qq.com',
  '163.com',
]);

// Best guess at a company name from a work email, e.g. jane@acme.co.uk -> "Acme"
const companyFromEmail = (email: string | undefined) => {
  const domain = email?.split('@')[1]?.toLowerCase();
  if (!domain || PERSONAL_EMAIL_DOMAINS.has(domain)) {
    return '';
  }

  const labels = domain.split('.');
  const secondLevel = labels[labels.length - 2] ?? '';
  // handle two-part TLDs like .co.uk and .com.au
  const name =
    labels.length > 2 && secondLevel.length <= 3 ? labels[labels.length - 3] : secondLevel;

  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
};

export const OnboardingView = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { updateUser } = useUpdateUser({ hideSuccessMessage: true });
  const { createOrganization } = useCreateOrganization({ dontRedirect: true });
  const { createRoom } = useCreateRoom();

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      company: companyFromEmail(user?.email),
      goal: 'live_interviews' as OnboardingGoal,
    },
    onSubmit: async ({ value }) => {
      await updateUser({ name: value.name });

      const response = await createOrganization({ name: value.company, goal: value.goal });
      if (!response.data) {
        return;
      }

      // Navigations below reload the page so the app picks up the new active organization.
      // Drop them straight into the thing they picked instead of an empty list.
      if (value.goal === 'assessments') {
        await navigate({ to: '/assessments', search: { new: true }, reloadDocument: true });
        return;
      }

      try {
        const room = await createRoom({
          title: 'My first interview',
          language: 'typescript',
          notes: '',
        });
        await navigate({
          to: '/room/$roomId',
          params: { roomId: room.id },
          search: { welcome: true },
          reloadDocument: true,
        });
      } catch {
        // createRoom already toasts the reason, so just land on the interviews list
        await navigate({ to: '/', reloadDocument: true });
      }
    },
  });

  return (
    <div className='min-h-screen flex flex-col justify-center items-center py-12 px-4'>
      <div className='w-full max-w-xl'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome to CoderScreen</h1>
        <p className='text-gray-500 mb-8 max-w-lg'>
          A few details and you're in. You can change all of this later.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-8'
        >
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value.trim()) return 'Name is required';
                if (value.length > 100) return 'Name must be less than 100 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className='block mb-2'>
                  Your name
                </Label>
                <Input
                  id={field.name}
                  placeholder='Jane Smith'
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

          <form.Field
            name='company'
            validators={{
              onChange: ({ value }: { value: string }) => {
                if (!value.trim()) return 'Company name is required';
                if (value.length > 100) return 'Company name must be less than 100 characters';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className='block mb-2'>
                  Company
                </Label>
                <Input
                  id={field.name}
                  placeholder='Acme Inc.'
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

          <form.Field name='goal'>
            {(field) => (
              <div>
                <Label className='block mb-2'>What do you want to do first?</Label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {GOALS.map((goal) => {
                    const selected = field.state.value === goal.value;
                    return (
                      <button
                        key={goal.value}
                        type='button'
                        aria-pressed={selected}
                        onClick={() => field.handleChange(goal.value)}
                        className={cx(
                          'flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors cursor-pointer',
                          selected
                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                            : 'border-gray-200 hover:bg-gray-50',
                          focusRing
                        )}
                      >
                        <div
                          className={cx(
                            'flex size-9 items-center justify-center rounded-md',
                            selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <goal.icon className='size-4.5' aria-hidden='true' />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{goal.label}</p>
                          <p className='text-xs text-muted-foreground'>{goal.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className='pt-2'>
                <Button
                  type='submit'
                  className='w-full'
                  isLoading={isSubmitting}
                  icon={RiArrowRightLine}
                  iconPosition='right'
                >
                  Get started
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
};
