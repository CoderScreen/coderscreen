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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { SmallHeader } from '@coderscreen/ui/heading';
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
  TableSkeleton,
} from '@coderscreen/ui/table';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiKey2Line,
  RiMore2Line,
} from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDatetime } from '@/lib/dateUtils';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/query/apiKey.query';

type ApiKey = NonNullable<ReturnType<typeof useApiKeys>['apiKeys']>[number];

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const MCP_URL = `${API_URL}/mcp`;
const KEY_PLACEHOLDER = '{YOUR_API_KEY}';

// Ready-to-paste MCP client config (Cursor / VS Code / Claude style).
const buildMcpConfig = (key: string) =>
  JSON.stringify(
    {
      mcpServers: {
        coderscreen: {
          url: MCP_URL,
          headers: { Authorization: `Bearer ${key}` },
        },
      },
    },
    null,
    2
  );

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
  toast.success('Copied to clipboard');
};

const CodeBlock = ({ code }: { code: string }) => (
  <div className='relative'>
    <pre className='overflow-x-auto rounded-md bg-gray-900 p-3 pr-11 text-xs leading-relaxed text-gray-100'>
      <code>{code}</code>
    </pre>
    <Button
      variant='secondary'
      icon={RiFileCopyLine}
      className='absolute right-2 top-2'
      onClick={() => copyToClipboard(code)}
    />
  </div>
);

export const ApiKeysView = () => {
  const { apiKeys, isLoading } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);

  return (
    <div className='min-h-screen flex flex-col p-4 max-w-4xl'>
      <div className='flex items-start justify-between'>
        <div>
          <SmallHeader>API Keys</SmallHeader>
          <MutedText>
            Use API keys to access the CoderScreen public API on behalf of your organization. Treat
            them like passwords.
          </MutedText>
        </div>
        <Button icon={RiAddLine} onClick={() => setCreateOpen(true)}>
          Create key
        </Button>
      </div>

      <Divider />

      <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Key</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Last used</TableHeaderCell>
              <TableHeaderCell className='text-right'>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton numRows={5} numCols={5} />
            ) : (apiKeys ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className='flex flex-col items-center justify-center gap-2 py-10 text-center'>
                    <RiKey2Line className='size-6 text-gray-400' />
                    <div className='text-sm font-medium text-gray-900'>No API keys yet</div>
                    <MutedText>Create your first key to start using the API.</MutedText>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (apiKeys ?? []).map((key) => (
                <TableRow key={key.id} className='group'>
                  <TableCell className='font-medium text-gray-900'>
                    {key.name ?? 'Unnamed'}
                  </TableCell>
                  <TableCell>
                    <code className='rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700'>
                      {key.prefix ? `${key.prefix}_` : ''}
                      {key.start ?? '••••'}…
                    </code>
                  </TableCell>
                  <TableCell className='text-sm text-gray-500'>
                    {formatDatetime(key.createdAt)}
                  </TableCell>
                  <TableCell className='text-sm text-gray-500'>
                    {key.lastRequest ? formatDatetime(key.lastRequest) : 'Never'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='icon' icon={RiMore2Line} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => setRevokeKey(key)}
                          className='text-red-600 focus:text-red-600 focus:bg-red-50'
                        >
                          <DropdownMenuIconWrapper className='text-red-600'>
                            <RiDeleteBinLine className='size-4' />
                          </DropdownMenuIconWrapper>
                          Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableRoot>

      <Divider />

      <div>
        <SmallHeader>Connect via MCP</SmallHeader>
        <MutedText>
          Use CoderScreen from AI tools like Claude, Cursor, and VS Code over the Model Context
          Protocol. Add the config below to your MCP client and replace the token with an API key
          from above.
        </MutedText>
      </div>

      <div className='mt-4 space-y-4'>
        <div className='space-y-1.5'>
          <Label>Server URL</Label>
          <CodeBlock code={MCP_URL} />
        </div>
        <div className='space-y-1.5'>
          <Label>Client config</Label>
          <CodeBlock code={buildMcpConfig(KEY_PLACEHOLDER)} />
        </div>
      </div>

      <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RevokeApiKeyDialog apiKey={revokeKey} onClose={() => setRevokeKey(null)} />
    </div>
  );
};

const CreateApiKeyDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { createApiKey, isLoading } = useCreateApiKey();
  const [name, setName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setCreatedKey(null);
    }
    onOpenChange(nextOpen);
  };

  const handleCreate = async () => {
    const result = await createApiKey({ name: name.trim() });
    setCreatedKey(result.key);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{createdKey ? 'API key created' : 'Create API key'}</DialogTitle>
        </DialogHeader>

        {createdKey ? (
          <div className='space-y-3'>
            <DialogDescription>
              Copy your key now. For security, you will not be able to see it again.
            </DialogDescription>
            <div className='flex items-center gap-2'>
              <code className='flex-1 overflow-x-auto rounded bg-gray-100 px-2 py-1.5 text-xs text-gray-800'>
                {createdKey}
              </code>
              <Button
                variant='secondary'
                icon={RiFileCopyLine}
                onClick={() => copyToClipboard(createdKey)}
              >
                Copy
              </Button>
            </div>

            <div className='space-y-1.5'>
              <Label>MCP client config</Label>
              <MutedText>Paste into your MCP client to connect AI tools right away.</MutedText>
              <CodeBlock code={buildMcpConfig(createdKey)} />
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            <Label htmlFor='api-key-name'>Name</Label>
            <Input
              id='api-key-name'
              placeholder='e.g. Production integration'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <MutedText>Give the key a name so you can recognize it later.</MutedText>
          </div>
        )}

        <DialogFooter>
          {createdKey ? (
            <Button onClick={() => handleClose(false)}>Done</Button>
          ) : (
            <>
              <Button variant='secondary' icon={RiCloseLine} onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                icon={RiAddLine}
                onClick={handleCreate}
                isLoading={isLoading}
                disabled={name.trim().length === 0}
              >
                Create
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RevokeApiKeyDialog = ({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey | null;
  onClose: () => void;
}) => {
  const { revokeApiKey, isLoading } = useRevokeApiKey();

  const handleRevoke = async () => {
    if (!apiKey) return;
    await revokeApiKey(apiKey.id);
    onClose();
  };

  return (
    <Dialog open={!!apiKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke API key</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to revoke <span className='font-medium'>{apiKey?.name}</span>? Any
          integration using this key will immediately stop working. This cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant='secondary' icon={RiCloseLine} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            icon={RiDeleteBinLine}
            onClick={handleRevoke}
            isLoading={isLoading}
          >
            Revoke
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
