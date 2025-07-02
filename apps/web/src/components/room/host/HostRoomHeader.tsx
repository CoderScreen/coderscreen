import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RiEditLine,
  RiCloseLine,
  RiCheckLine,
  RiFileTextLine,
  RiUserLine,
} from '@remixicon/react';
import { toast } from 'sonner';
import { useRoomContext } from '@/contexts/RoomContext';
import { useEndRoom, useRoom, useUpdateRoom } from '@/query/room.query';
import { Skeleton } from '@/components/ui/skeleton';
import { cx } from '@/lib/utils';
import { Shortcut } from '@/components/common/Shortcut';
import { Tooltip } from '@/components/ui/tooltip';
import { ConnectedUser } from '@/query/realtime.query';

const APP_URL = import.meta.env.VITE_APP_URL as string;
if (!APP_URL) {
  throw new Error('VITE_APP_URL is not set');
}

export const HostRoomHeader = () => {
  const { room, isLoading } = useRoom();
  const { updateRoom } = useUpdateRoom();
  const { connectedUsers, provider } = useRoomContext();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(room?.title);

  const [isEndInterviewOpen, setIsEndInterviewOpen] = useState(false);

  const [copied, setCopied] = useState(false);

  const { endRoom, isLoading: isEndingRoom } = useEndRoom();

  const handleCopyLink = async () => {
    try {
      const shareLink = `${APP_URL}/room/${room?.id}`;
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleSaveTitle = async () => {
    if (!title || title.trim().length < 3) {
      toast.error('Room title must be at least 3 characters long');
      setTitle(room?.title); // Reset to original title
      setIsEditingTitle(false);
      return;
    }

    setIsEditingTitle(false);

    if (!room || title.trim() === room.title) {
      return;
    }

    await updateRoom({
      id: room.id,
      data: {
        title: title.trim(),
      },
    });
  };

  const handleEndInterview = async () => {
    await endRoom();
  };

  useEffect(() => {
    if (room && !isEditingTitle) {
      setTitle(room.title);
    }
  }, [room]);

  // Get unique users by email (in case of multiple connections)
  const uniqueUsers = connectedUsers.reduce(
    (acc: ConnectedUser[], user: ConnectedUser) => {
      if (!acc.find((u: ConnectedUser) => u.email === user.email)) {
        acc.push(user);
      }
      return acc;
    },
    [] as ConnectedUser[]
  );

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
              className='p-0'
              inputClassName='p-0 text-lg sm:text-lg border-none shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none'
              autoFocus
            />
          ) : isLoading ? (
            <Skeleton className='w-42 h-6' />
          ) : (
            <Tooltip content='Click to edit title'>
              <span
                className='w-full text-lg cursor-pointer hover:text-muted-foreground transition-colors overflow-hidden text-ellipsis whitespace-nowrap'
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </span>
            </Tooltip>
          )}
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <div
            className={cx(
              'w-2 h-2 rounded-full',
              provider.wsconnected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span
            className={cx(
              provider.wsconnected ? 'text-green-600' : 'text-red-600'
            )}
          >
            {provider.wsconnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Connected Users */}
        <div className='flex items-center gap-2 ml-4'>
          <RiUserLine className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm text-muted-foreground'>
            {uniqueUsers.length} connected
          </span>
          {uniqueUsers.length > 0 && (
            <div className='flex items-center gap-1'>
              {uniqueUsers
                .slice(0, 3)
                .map((user: ConnectedUser, index: number) => (
                  <Tooltip key={user.clientId} content={user.email}>
                    <div
                      className='w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white'
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Tooltip>
                ))}
              {uniqueUsers.length > 3 && (
                <span className='text-xs text-muted-foreground'>
                  +{uniqueUsers.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='secondary' icon={RiFileTextLine}>
          Load Template
          <Shortcut cmd _key='T' variant='dark' />
        </Button>

        <Button
          variant='secondary'
          onClick={handleCopyLink}
          className='flex items-center gap-2'
        >
          {copied ? (
            <RiCheckLine className='h-4 w-4' />
          ) : (
            <RiEditLine className='h-4 w-4' />
          )}
          {copied ? 'Copied!' : 'Share Link'}
          <Shortcut cmd _key='S' variant='dark' />
        </Button>

        <Button
          variant='destructive'
          onClick={() => setIsEndInterviewOpen(true)}
          icon={RiCloseLine}
          disabled={isEndingRoom}
        >
          End Interview
          <Shortcut cmd _key='E' />
        </Button>

        {/* <DropdownMenu>
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
        </DropdownMenu> */}
      </div>

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
              isLoading={isEndingRoom}
            >
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  
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
      </Dialog> */}
    </div>
  );
};
