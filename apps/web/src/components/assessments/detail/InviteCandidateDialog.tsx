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
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiFileCopyLine,
  RiMailSendLine,
  RiSearchLine,
  RiUserAddLine,
} from '@remixicon/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCandidates, useInviteCandidate } from '@/query/assessment.query';

interface InviteCandidateDialogProps {
  assessmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'existing' | 'new';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 8;

export const InviteCandidateDialog = ({
  assessmentId,
  open,
  onOpenChange,
}: InviteCandidateDialogProps) => {
  const { inviteCandidate, isLoading } = useInviteCandidate(assessmentId);
  const { candidates } = useCandidates();

  const hasCandidates = (candidates?.length ?? 0) > 0;
  const [mode, setMode] = useState<Mode>(hasCandidates ? 'existing' : 'new');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; pick?: string }>({});

  const [accessLink, setAccessLink] = useState<string | null>(null);

  // Re-default mode when candidate list loads after the dialog opens
  useEffect(() => {
    if (open && hasCandidates && mode === 'new' && !name && !email) {
      setMode('existing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCandidates, open]);

  const filteredCandidates = useMemo(() => {
    const list = candidates ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const pageCount = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedCandidates = useMemo(
    () => filteredCandidates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredCandidates, safePage]
  );

  // Reset to page 1 whenever the search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetState = () => {
    setSearch('');
    setPage(1);
    setSelectedCandidateId('');
    setName('');
    setEmail('');
    setErrors({});
    setAccessLink(null);
    setMode(hasCandidates ? 'existing' : 'new');
  };

  const handleClose = (openState: boolean) => {
    if (!openState) resetState();
    onOpenChange(openState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'existing') {
      if (!selectedCandidateId) {
        setErrors({ pick: 'Select a candidate from the list' });
        return;
      }
      setErrors({});
      const result = await inviteCandidate({
        candidateId: selectedCandidateId as `cand_${string}`,
      });
      handleSuccess(result);
      return;
    }

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) nextErrors.email = 'Invalid email address';
    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const result = await inviteCandidate({
      candidateName: name.trim(),
      candidateEmail: email.trim(),
    });
    handleSuccess(result);
  };

  const handleSuccess = (result: unknown) => {
    if (result && typeof result === 'object' && 'accessToken' in result) {
      const { id, accessToken } = result as { id: string; accessToken: string };
      setAccessLink(`${window.location.origin}/take/${id}?token=${accessToken}`);
    }
  };

  const handleCopyLink = () => {
    if (accessLink) {
      navigator.clipboard.writeText(accessLink);
      toast.success('Link copied to clipboard');
    }
  };

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

  const submitDisabled =
    mode === 'existing' ? !selectedCandidateId : !name.trim() || !email.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Invite Candidate</DialogTitle>
          <DialogDescription>
            Send an assessment invitation to a new or existing candidate.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as Mode);
            setErrors({});
          }}
          className='mt-4'
        >
          <TabsList variant='solid' className='w-full'>
            <TabsTrigger value='existing' className='flex-1' disabled={!hasCandidates}>
              Existing
            </TabsTrigger>
            <TabsTrigger value='new' className='flex-1'>
              New
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className='space-y-4 mt-6'>
          {mode === 'existing' ? (
            <div>
              <div className='relative mb-3 group'>
                <RiSearchLine className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-500' />
                <input
                  type='text'
                  placeholder='Search candidates by name or email'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className='w-full h-10 pl-9 pr-9 bg-gray-50 border border-gray-200 rounded-md text-sm placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer'
                    aria-label='Clear search'
                  >
                    <RiCloseLine className='size-4' />
                  </button>
                )}
              </div>

              <div className='border border-gray-200 rounded-md overflow-hidden'>
                {filteredCandidates.length === 0 ? (
                  <div className='flex flex-col items-center justify-center text-center py-8 px-4 gap-2'>
                    <p className='text-sm text-gray-500'>
                      {search.trim()
                        ? `No candidates match "${search.trim()}"`
                        : 'No candidates yet'}
                    </p>
                    <Button
                      type='button'
                      variant='secondary'
                      icon={RiUserAddLine}
                      onClick={() => {
                        const guess = search.trim();
                        if (guess) {
                          if (EMAIL_RE.test(guess)) setEmail(guess);
                          else setName(guess);
                        }
                        setMode('new');
                        setErrors({});
                      }}
                    >
                      Create new candidate
                    </Button>
                  </div>
                ) : (
                  <>
                    <ul className='divide-y divide-gray-100'>
                      {pagedCandidates.map((c) => {
                        const isSelected = selectedCandidateId === c.id;
                        return (
                          <li key={c.id}>
                            <button
                              type='button'
                              onClick={() => {
                                setSelectedCandidateId(c.id);
                                setErrors({});
                              }}
                              className={`w-full text-left px-3 py-2.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className='min-w-0'>
                                <div className='text-sm font-medium text-gray-900 truncate'>
                                  {c.name}
                                </div>
                                <div className='text-xs text-gray-500 truncate'>{c.email}</div>
                              </div>
                              {isSelected && (
                                <RiCheckboxCircleLine className='size-5 text-blue-600 shrink-0' />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    {pageCount > 1 && (
                      <div className='flex items-center justify-between border-t border-gray-100 px-3 py-2 bg-gray-50'>
                        <span className='text-xs text-gray-500'>
                          {(safePage - 1) * PAGE_SIZE + 1}–
                          {Math.min(safePage * PAGE_SIZE, filteredCandidates.length)} of{' '}
                          {filteredCandidates.length}
                        </span>
                        <div className='flex items-center gap-1'>
                          <button
                            type='button'
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className='p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                            aria-label='Previous page'
                          >
                            <RiArrowLeftSLine className='size-4' />
                          </button>
                          <span className='text-xs text-gray-600 tabular-nums px-1'>
                            {safePage} / {pageCount}
                          </span>
                          <button
                            type='button'
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                            disabled={safePage === pageCount}
                            className='p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer'
                            aria-label='Next page'
                          >
                            <RiArrowRightSLine className='size-4' />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {errors.pick && <p className='text-sm text-red-600 mt-2'>{errors.pick}</p>}
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor='candidateName' className='block text-sm font-medium text-gray-700 mb-2'>
                  Name
                </Label>
                <Input
                  id='candidateName'
                  placeholder='John Doe'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  hasError={!!errors.name}
                  autoFocus
                />
                {errors.name && <p className='text-sm text-red-600 mt-1'>{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor='candidateEmail' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </Label>
                <Input
                  id='candidateEmail'
                  type='email'
                  placeholder='john@example.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  hasError={!!errors.email}
                />
                {errors.email && <p className='text-sm text-red-600 mt-1'>{errors.email}</p>}
              </div>
            </>
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
              disabled={submitDisabled}
            >
              Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
