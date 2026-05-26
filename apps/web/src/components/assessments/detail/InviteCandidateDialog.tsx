import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Input } from '@coderscreen/ui/input';
import { Label } from '@coderscreen/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from '@coderscreen/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { RiCheckboxCircleLine, RiCheckLine, RiFileCopyLine, RiMailSendLine } from '@remixicon/react';
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
  const [search, setSearch] = useState('');

  const form = useForm({
    defaultValues: {
      candidateId: '',
      candidateName: '',
      candidateEmail: '',
    },
    onSubmit: async ({ value }) => {
      const data =
        mode === 'existing'
          ? { candidateId: value.candidateId as `cand_${string}`, isGenericLink: false as const }
          : { candidateName: value.candidateName, candidateEmail: value.candidateEmail, isGenericLink: false as const };

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
      setSearch('');
      form.reset();
    }
    onOpenChange(openState);
  };

  const filteredCandidates = search.trim()
    ? (candidates ?? []).filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : (candidates ?? []);

  // After invite is successful, show the link
  if (accessLink) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <div className='text-center py-4'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4'>
              <RiCheckboxCircleLine className='w-6 h-6 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>Invitation Created</h3>
            <p className='text-sm text-gray-500 mb-6'>
              Share this link with the candidate to start the assessment.
            </p>

            <div className='bg-gray-50 rounded-lg p-3 mb-4'>
              <Input value={accessLink} readOnly className='text-xs font-mono bg-white' />
            </div>

            <div className='flex gap-2 justify-center'>
              <Button variant='secondary' icon={RiFileCopyLine} onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Invite Candidate</DialogTitle>
          <DialogDescription>
            Send an assessment invitation to a new or existing candidate.
          </DialogDescription>
        </DialogHeader>

        {/* Mode toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'new' | 'existing')} className='mt-4'>
          <TabsList variant='solid' className='w-full'>
            <TabsTrigger value='new' className='flex-1'>
              New Candidate
            </TabsTrigger>
            <TabsTrigger
              value='existing'
              className='flex-1'
              disabled={!candidates || candidates.length === 0}
            >
              Existing Candidate
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-4 mt-6'
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
            <form.Field name='candidateId'>
              {(field) => (
                <div>
                  <Input
                    placeholder='Search by name or email...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='mb-3'
                  />
                  <div className='max-h-64 overflow-y-auto'>
                    <TableRoot>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Email</TableHeaderCell>
                            <TableHeaderCell className='w-10' />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCandidates.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3}>
                                <div className='text-center py-6 text-sm text-gray-500'>
                                  No candidates found.
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCandidates.map((c) => {
                              const isSelected = field.state.value === c.id;
                              return (
                                <TableRow
                                  key={c.id}
                                  className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                  onClick={() => field.handleChange(c.id)}
                                >
                                  <TableCell className='text-sm'>{c.name}</TableCell>
                                  <TableCell className='text-sm text-gray-500'>
                                    {c.email}
                                  </TableCell>
                                  <TableCell>
                                    {isSelected && (
                                      <RiCheckLine className='size-4 text-blue-600' />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableRoot>
                  </div>
                  {field.state.meta.errors?.length > 0 && (
                    <p className='text-sm text-red-600 mt-2'>
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
              disabled={mode === 'existing' && !form.state.values.candidateId}
            >
              Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
