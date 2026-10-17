import { Button } from '@coderscreen/ui/button';
import { SmallHeader } from '@coderscreen/ui/heading';
import { MutedText } from '@coderscreen/ui/typography';
import { RiAddLine } from '@remixicon/react';
import { useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import { Shortcut } from '@/components/common/Shortcut';
import { useCreateRoom } from '@/query/room.query';

export function DashboardHeader() {
  const { createRoom, isLoading } = useCreateRoom();
  const router = useRouter();
  // Each call spends an interview credit, so ignore calls while one is in flight.
  const isCreatingRef = useRef(false);

  const handleCreateRoom = useCallback(async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;

    const randomTitle = `Interview ${Math.random().toString(36).substring(2, 15)}`;

    try {
      const room = await createRoom({
        title: randomTitle,
        language: 'typescript',
        notes: '',
      });

      router.navigate({ to: `/room/${room.id}` });
    } catch {
      // The mutation already toasts the reason (e.g. plan limit reached).
    } finally {
      isCreatingRef.current = false;
    }
  }, [createRoom, router]);

  // "C" starts a new interview. Only a bare keypress on the page itself counts:
  // typing in a field or dialog (e.g. the support form), Cmd/Ctrl+C, and key
  // repeat each used to create a room and spend an interview credit.
  useEffect(() => {
    const handleKeyboardShortcut = async (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'c') return;
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.closest('input, textarea, select, [role="dialog"], [role="alertdialog"]')
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;

      event.preventDefault();
      await handleCreateRoom();
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleCreateRoom]);

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Interviews</SmallHeader>
        <MutedText>Conduct real-time coding interviews with candidates</MutedText>
      </div>

      <div className='flex items-center gap-2'>
        <Button icon={RiAddLine} onClick={handleCreateRoom} isLoading={isLoading}>
          <span>New Interview</span>
          <Shortcut _key='C' />
        </Button>
      </div>
    </div>
  );
}
