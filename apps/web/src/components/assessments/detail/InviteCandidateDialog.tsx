import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Label } from '@coderscreen/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@coderscreen/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { Textarea } from '@coderscreen/ui/textarea';
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFileCopyLine,
  RiMailSendLine,
  RiSearchLine,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { siteConfig } from '@/lib/siteConfig';
import { useBulkInvite, useCandidates } from '@/query/assessment.query';
import { useUsage } from '@/query/billing.query';
import { parseApiError } from '@/query/error.query';

interface InviteCandidateDialogProps {
  assessmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'existing' | 'new';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEADLINES = [
  { value: 'none', label: 'No deadline' },
  { value: '3', label: 'Within 3 days' },
  { value: '7', label: 'Within 7 days' },
  { value: '14', label: 'Within 14 days' },
];

type Parsed = { name?: string; email: string } | { error: string };

/** One candidate per line: "Ada Park <ada@acme.com>", "Ada Park, ada@acme.com" or "ada@acme.com". */
export const parseCandidateLines = (text: string): Parsed[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)[\s,;]*<?([^\s<>,;]+@[^\s<>,;]+)>?$/);
      const email = match?.[2];
      if (!email || !EMAIL_RE.test(email)) return { error: line };
      const name = match[1].replace(/^["']|["']$/g, '').trim();
      return name ? { name, email } : { email };
    });

type InviteResult = {
  status: 'invited' | 'already_invited' | 'failed';
  name: string | null;
  email: string | null;
  submissionId?: string;
  accessToken?: string;
  emailSent?: boolean | null;
  error?: string;
};

export const InviteCandidateDialog = ({
  assessmentId,
  open,
  onOpenChange,
}: InviteCandidateDialogProps) => {
  const { bulkInvite, isLoading, error: inviteError, reset } = useBulkInvite(assessmentId);
  const { candidates } = useCandidates();
  const { usage } = useUsage('assessment_invite');

  const list = (candidates ?? []) as { id: string; name: string; email: string }[];
  const [pickedMode, setMode] = useState<Mode | null>(null);
  const mode: Mode = pickedMode ?? (list.length > 0 ? 'existing' : 'new');

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pasted, setPasted] = useState('');
  const [deadline, setDeadline] = useState('7');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<InviteResult[] | null>(null);

  const parsed = useMemo(() => parseCandidateLines(pasted), [pasted]);
  const invalid = parsed.filter((p): p is { error: string } => 'error' in p);
  const valid = parsed.filter((p): p is { name?: string; email: string } => !('error' in p));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [list, search]);

  const resetForm = () => {
    setMode(null);
    setSearch('');
    setSelected(new Set());
    setPasted('');
    setDeadline('7');
    setMessage('');
    setResults(null);
    reset();
  };

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = mode === 'existing' ? selected.size : valid.length;
  const submitDisabled = usage?.exceeded || count === 0 || (mode === 'new' && invalid.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const people =
      mode === 'existing'
        ? [...selected].map((id) => ({ candidateId: id as `cand_${string}` }))
        : valid;
    try {
      const res = await bulkInvite({
        candidates: people,
        startByDays: deadline === 'none' ? null : Number(deadline),
        message: message.trim() || undefined,
      });
      setResults(res.results as InviteResult[]);
    } catch {
      // Rendered inline from `inviteError`.
    }
  };

  if (results) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Invites</DialogTitle>
            <DialogDescription>{summarize(results)}</DialogDescription>
          </DialogHeader>
          <ul className='mt-4 divide-y divide-gray-100 border border-gray-200 rounded-md max-h-80 overflow-y-auto'>
            {results.map((r, i) => (
              <ResultRow key={r.submissionId ?? `${r.email}-${i}`} result={r} />
            ))}
          </ul>
          <div className='flex justify-end pt-4'>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Invite candidates</DialogTitle>
          <DialogDescription>
            Each candidate gets an email with their own link to the assessment.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className='mt-4'>
          <TabsList variant='solid' className='w-full'>
            <TabsTrigger value='existing' className='flex-1' disabled={list.length === 0}>
              Existing
            </TabsTrigger>
            <TabsTrigger value='new' className='flex-1'>
              New
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          {mode === 'existing' ? (
            <div>
              <div className='relative mb-3'>
                <RiSearchLine className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none' />
                <input
                  type='text'
                  placeholder='Search candidates by name or email'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full h-10 pl-9 pr-9 bg-gray-50 border border-gray-200 rounded-md text-sm placeholder:text-gray-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                />
                {search && (
                  <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer'
                    aria-label='Clear search'
                  >
                    <RiCloseLine className='size-4' />
                  </button>
                )}
              </div>
              <ul className='border border-gray-200 rounded-md divide-y divide-gray-100 max-h-60 overflow-y-auto'>
                {filtered.length === 0 ? (
                  <li className='py-6 text-center text-sm text-gray-500'>No candidates match</li>
                ) : (
                  filtered.map((c) => {
                    const isSelected = selected.has(c.id);
                    return (
                      <li key={c.id}>
                        <button
                          type='button'
                          onClick={() => toggle(c.id)}
                          className={`w-full text-left px-3 py-2.5 cursor-pointer flex items-center justify-between gap-3 ${
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
                  })
                )}
              </ul>
            </div>
          ) : (
            <div>
              <Label htmlFor='pasted' className='block text-sm font-medium text-gray-700 mb-2'>
                One candidate per line
              </Label>
              <Textarea
                id='pasted'
                rows={5}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder={'Ada Park <ada@acme.com>\nben@acme.com'}
                hasError={invalid.length > 0}
                autoFocus
              />
              {invalid.length > 0 ? (
                <p className='text-sm text-red-600 mt-1'>
                  No email found in: {invalid.map((i) => `"${i.error}"`).join(', ')}
                </p>
              ) : (
                <p className='text-xs text-gray-500 mt-1'>
                  A name is optional. Without one, we use the part before the @.
                </p>
              )}
            </div>
          )}

          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-2'>Must start</Label>
            <Select value={deadline} onValueChange={setDeadline}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
              Personal message <span className='font-normal text-gray-400'>(optional)</span>
            </Label>
            <Textarea
              id='message'
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Added to the invite email.'
              maxLength={2000}
            />
          </div>

          {usage?.exceeded && (
            <div className='px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg'>
              <p className='text-sm text-amber-800'>
                You've used all {usage.limit} assessment invites included in your plan this billing
                period.{' '}
                <Link to={siteConfig.routes.billing} className='font-medium underline'>
                  Upgrade your plan
                </Link>{' '}
                to invite more candidates.
              </p>
            </div>
          )}

          {inviteError && (
            <div className='px-3 py-2 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-700'>{parseApiError(inviteError).message}</p>
            </div>
          )}

          <div className='flex justify-end gap-3 pt-2'>
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
              {count > 1 ? `Invite ${count}` : 'Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const summarize = (results: InviteResult[]) => {
  const n = (status: InviteResult['status']) => results.filter((r) => r.status === status).length;
  const notEmailed = results.filter((r) => r.status === 'invited' && r.emailSent === false).length;
  const parts = [
    n('invited') > 0 && `${n('invited')} invited`,
    n('already_invited') > 0 && `${n('already_invited')} already had an open invite (no new email)`,
    n('failed') > 0 && `${n('failed')} failed`,
    notEmailed > 0 && `${notEmailed} couldn't be emailed, so share their link`,
  ].filter(Boolean);
  return `${parts.join(', ')}.`;
};

const ResultRow = ({ result }: { result: InviteResult }) => {
  const link =
    result.submissionId && result.accessToken
      ? `${window.location.origin}/take/${result.submissionId}?token=${result.accessToken}`
      : null;
  const ok = result.status !== 'failed' && result.emailSent !== false;

  return (
    <li className='flex items-center justify-between gap-3 px-3 py-2.5'>
      <div className='flex items-center gap-2 min-w-0'>
        {ok ? (
          <RiCheckboxCircleLine className='size-4 text-green-600 shrink-0' />
        ) : (
          <RiErrorWarningLine className='size-4 text-amber-600 shrink-0' />
        )}
        <div className='min-w-0'>
          <div className='text-sm text-gray-900 truncate'>
            {result.name ?? result.email ?? 'Candidate'}
          </div>
          <div className='text-xs text-gray-500 truncate'>
            {result.status === 'failed'
              ? result.error
              : result.status === 'already_invited'
                ? 'Already invited'
                : result.emailSent === false
                  ? "Couldn't email them"
                  : result.email}
          </div>
        </div>
      </div>
      {link && (
        <Button
          variant='secondary'
          icon={RiFileCopyLine}
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast.success('Link copied');
          }}
        >
          Copy link
        </Button>
      )}
    </li>
  );
};
