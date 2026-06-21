import { Button } from '@coderscreen/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@coderscreen/ui/dialog';
import { Label } from '@coderscreen/ui/label';
import { Textarea } from '@coderscreen/ui/textarea';
import { RiMailSendLine } from '@remixicon/react';
import { useState } from 'react';
import { useSendSupportMessage } from '@/query/support.query';

interface EnterpriseContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MESSAGE =
  "I'm interested in the Enterprise plan and would like to talk to your sales team.";

// Prefix so the support inbox can immediately tell this is an enterprise sales lead.
const ENTERPRISE_PREFIX = '[Enterprise Plan Request]';

export const EnterpriseContactDialog = ({ open, onOpenChange }: EnterpriseContactDialogProps) => {
  const { sendSupportMessage, isLoading } = useSendSupportMessage();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [error, setError] = useState<string | undefined>();

  const resetState = () => {
    setMessage(DEFAULT_MESSAGE);
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

    await sendSupportMessage({ message: `${ENTERPRISE_PREFIX} ${message.trim()}` });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Contact sales</DialogTitle>
          <DialogDescription>
            Tell us about your needs and our team will reach out about the Enterprise plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <div>
            <Label
              htmlFor='enterpriseMessage'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              How can we help?
            </Label>
            <Textarea
              id='enterpriseMessage'
              placeholder='Tell us about your team size, use case, and what you need...'
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
              Send request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
