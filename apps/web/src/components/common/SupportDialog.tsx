import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Label } from '@coderscreen/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@coderscreen/ui/tabs';
import { Textarea } from '@coderscreen/ui/textarea';
import { RiDiscordLine, RiExternalLinkLine, RiMailSendLine } from '@remixicon/react';
import { useState } from 'react';
import { siteConfig } from '@/lib/siteConfig';
import { useSendSupportMessage } from '@/query/support.query';

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'message' | 'discord';

export const SupportDialog = ({ open, onOpenChange }: SupportDialogProps) => {
  const { sendSupportMessage, isLoading } = useSendSupportMessage();
  const [mode, setMode] = useState<Mode>('message');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();

  const resetState = () => {
    setMode('message');
    setMessage('');
    setError(undefined);
  };

  const handleClose = (openState: boolean) => {
    if (!openState) resetState();
    onOpenChange(openState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    setError(undefined);

    await sendSupportMessage({ message: message.trim() });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Get support</DialogTitle>
          <DialogDescription>
            Send us a message or join our Discord community for help.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className='mt-4'>
          <TabsList variant='solid' className='w-full'>
            <TabsTrigger value='message' className='flex-1'>
              Send a message
            </TabsTrigger>
            <TabsTrigger value='discord' className='flex-1'>
              Join Discord
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'message' ? (
          <form onSubmit={handleSubmit} className='space-y-4 mt-6'>
            <div>
              <Label
                htmlFor='supportMessage'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                How can we help?
              </Label>
              <Textarea
                id='supportMessage'
                placeholder='Describe your question or issue...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                hasError={!!error}
                rows={6}
                autoFocus
              />
              {error && <p className='text-sm text-red-600 mt-1'>{error}</p>}
              <p className='text-xs text-gray-500 mt-2'>
                We’ll reply to your account email. Our team is usually quick to respond.
              </p>
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <Button type='button' variant='secondary' onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                isLoading={isLoading}
                icon={RiMailSendLine}
                iconPosition='right'
                disabled={!message.trim()}
              >
                Send message
              </Button>
            </div>
          </form>
        ) : (
          <div className='mt-6 flex flex-col items-center text-center py-4'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5865F2]/10 mb-4'>
              <RiDiscordLine className='w-6 h-6 text-[#5865F2]' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>Join our Discord</h3>
            <p className='text-sm text-gray-500 mb-6 max-w-sm'>
              Chat with the CoderScreen team and other users, get help, and share feedback in real
              time.
            </p>
            <a href={siteConfig.externalRoutes.discord} target='_blank' rel='noopener noreferrer'>
              <Button icon={RiDiscordLine} iconPosition='left'>
                Open Discord
                <RiExternalLinkLine className='size-3.5 ml-1.5' />
              </Button>
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
