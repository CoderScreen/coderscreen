import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  RiEditLine,
  RiCloseLine,
  RiRefreshLine,
  RiFeedbackLine,
  RiSendPlaneLine,
  RiCheckLine,
  RiMore2Line,
} from '@remixicon/react';
import { toast } from 'sonner';
import { useRealtimeConnection } from '@/query/realtime.query';

interface HostRoomHeaderProps {
  roomId: string;
  roomTitle?: string;
  onEndInterview?: () => void;
  onResetRoom?: () => void;
  onUpdateRoomTitle?: (title: string) => void;
}

export const HostRoomHeader = ({
  roomId,
  roomTitle = 'Untitled Interview',
}: HostRoomHeaderProps) => {
  const { connectionStatus } = useRealtimeConnection();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(roomTitle);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isEndInterviewOpen, setIsEndInterviewOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/room/${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
  };

  const handleSendFeedback = () => {
    //
  };

  const handleEndInterview = () => {
    //
  };

  const handleResetRoom = () => {
    //
  };

  return (
    <div className='flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      {/* Room Title Section */}
      <div className='flex items-center gap-2'>
        <div className='max-w-80'>
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              className='w-full p-0'
              inputClassName='p-0 text-lg sm:text-lg w-full border-none shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none'
              autoFocus
            />
          ) : (
            <span
              className='w-full text-lg cursor-pointer hover:text-muted-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap'
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span
            className={
              connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
            }
          >
            {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Actions Menu */}
      <div className='flex items-center gap-2'>
        {/* Share Link Button */}
        <Button
          variant='light'
          onClick={handleCopyLink}
          className='flex items-center gap-2'
        >
          {copied ? (
            <RiCheckLine className='h-4 w-4' />
          ) : (
            <RiEditLine className='h-4 w-4' />
          )}
          {copied ? 'Copied!' : 'Share Link'}
        </Button>

        <Button
          variant='destructive'
          onClick={() => setIsEndInterviewOpen(true)}
          icon={RiCloseLine}
        >
          End Interview
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='secondary' className='p-2'>
              <RiMore2Line className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuItem onClick={() => setIsFeedbackOpen(true)}>
              <RiFeedbackLine className='h-4 w-4 mr-1' />
              Send Feedback
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsResetOpen(true)}>
              <RiRefreshLine className='h-4 w-4 mr-1' />
              Reset Room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by sharing your feedback or reporting issues.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder='Describe your feedback or issue...'
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant='secondary'
              onClick={() => setIsFeedbackOpen(false)}
              icon={RiCloseLine}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendFeedback}
              disabled={!feedbackMessage.trim()}
              icon={RiSendPlaneLine}
            >
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Interview Dialog */}
      <Dialog open={isEndInterviewOpen} onOpenChange={setIsEndInterviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this interview? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='secondary'
              onClick={() => setIsEndInterviewOpen(false)}
              icon={RiCloseLine}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleEndInterview}
              icon={RiCheckLine}
            >
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Room Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Room</DialogTitle>
            <DialogDescription>
              This will reset all code, instructions, and whiteboard content.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='secondary'
              onClick={() => setIsResetOpen(false)}
              icon={RiCloseLine}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleResetRoom}
              icon={RiRefreshLine}
            >
              Reset Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
