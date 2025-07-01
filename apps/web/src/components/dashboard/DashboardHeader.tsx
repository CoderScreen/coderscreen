import { Shortcut } from '@/components/common/Shortcut';
import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { MutedText } from '@/components/ui/typography';
import { useCreateRoom } from '@/query/room.query';
import { RiAddLine, RiCommandLine } from '@remixicon/react';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export function DashboardHeader() {
  const { createRoom, isLoading } = useCreateRoom();
  const router = useRouter();

  const handleCreateRoom = async () => {
    const randomTitle = `Interview ${Math.random().toString(36).substring(2, 15)}`;

    const room = await createRoom({
      title: randomTitle,
      language: 'typescript',
      notes: '',
    });

    router.navigate({ to: `/room/${room.id}` });
  };

  // add keyboard shortcut for CMD + I for new interview
  useEffect(() => {
    const handleKeyboardShortcut = async (event: KeyboardEvent) => {
      if (event.metaKey && event.key.toLowerCase() === 'i') {
        await handleCreateRoom();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Interviews</SmallHeader>
        <MutedText>Manage your interviews</MutedText>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          icon={RiAddLine}
          onClick={handleCreateRoom}
          isLoading={isLoading}
        >
          <span>New Interview</span>
          <Shortcut cmd _key='I' />
        </Button>
      </div>
    </div>
  );
}
