import { Button } from '@coderscreen/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@coderscreen/ui/dialog';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { RiFileCopyLine, RiMailSendLine } from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCandidates, useInviteCandidate } from '@/query/assessment.query';

interface InviteCandidateDialogProps {
  assessmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteCandidateDialog = ({
  assessmentId,
  open,
  onOpenChange,
}: InviteCandidateDialogProps) => {
  const { inviteCandidate, isLoading } = useInviteCandidate(assessmentId);
  const { candidates } = useCandidates();
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [accessLink, setAccessLink] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      candidateId: '',
      candidateName: '',
      candidateEmail: '',
    },
    onSubmit: async ({ value }) => {
      const data =
        mode === 'existing'
          ? { candidateId: value.candidateId as `cand_${string}` }
          : { candidateName: value.candidateName, candidateEmail: value.candidateEmail };

      const result = await inviteCandidate(data);

      // Show the access link
      if (result && typeof result === 'object' && 'accessToken' in result) {
        const token = (result as { accessToken: string }).accessToken;
        const link = `${window.location.origin}/take/${(result as { id: string }).id}?token=${token}`;
        setAccessLink(link);
      }
    },
  });

  const handleCopyLink = () => {
    if (accessLink) {
      navigator.clipboard.writeText(accessLink);
      toast.success('Link copied to clipboard');
    }
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      setAccessLink(null);
      setMode('new');
      form.reset();
    }
    onOpenChange(openState);
  };

  // After invite is successful, show the link
  if (accessLink) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Candidate Invited</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-500'>
              Share this link with the candidate to take the assessment:
            </p>
            <div className='flex items-center gap-2'>
              <Input value={accessLink} readOnly className='text-xs font-mono' />
              <Button variant='secondary' icon={RiFileCopyLine} onClick={handleCopyLink}>
                Copy
              </Button>
            </div>
            <div className='flex justify-end pt-2'>
              <Button variant='secondary' onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite Candidate</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className='flex gap-2 mb-4'>
          <Button
            variant={mode === 'new' ? 'primary' : 'secondary'}
            onClick={() => setMode('new')}
            className='flex-1'
          >
            New Candidate
          </Button>
          <Button
            variant={mode === 'existing' ? 'primary' : 'secondary'}
            onClick={() => setMode('existing')}
            className='flex-1'
            disabled={!candidates || candidates.length === 0}
          >
            Existing Candidate
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-4'
        >
          {mode === 'new' ? (
            <>
              <form.Field
                name='candidateName'
                validators={{
                  onChange: ({ value }: { value: string }) => {
                    if (!value) return 'Name is required';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Label
                      htmlFor={field.name}
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
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
                      <p className='text-sm text-red-600 mt-1'>
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name='candidateEmail'
                validators={{
                  onChange: ({ value }: { value: string }) => {
                    if (!value) return 'Email is required';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                      return 'Invalid email address';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Label
                      htmlFor={field.name}
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
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
                      <p className='text-sm text-red-600 mt-1'>
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </>
          ) : (
            <form.Field
              name='candidateId'
              validators={{
                onChange: ({ value }: { value: string }) => {
                  if (!value) return 'Select a candidate';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <Label className='block text-sm font-medium text-gray-700 mb-2'>
                    Select Candidate
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                  >
                    <SelectTrigger hasError={!field.state.meta.isValid}>
                      <SelectValue placeholder='Choose a candidate...' />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors?.length > 0 && (
                    <p className='text-sm text-red-600 mt-1'>
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          )}

          <div className='flex justify-end gap-3 pt-4'>
            <Button type='button' variant='secondary' onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              isLoading={isLoading}
              icon={RiMailSendLine}
              iconPosition='right'
            >
              Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
