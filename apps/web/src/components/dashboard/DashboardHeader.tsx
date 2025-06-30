import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { useCreateRoom } from '@/query/room.query';
import { RiAddLine, RiCommandLine } from '@remixicon/react';
import { useRouter } from '@tanstack/react-router';

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

  return (
    <div className='flex items-center justify-between py-4'>
      <div className='flex flex-col'>
        <SmallHeader>Interviews</SmallHeader>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          icon={RiAddLine}
          onClick={handleCreateRoom}
          isLoading={isLoading}
        >
          <span>New Interview</span>
          <div className='flex items-center justify-center bg-white/20 text-white/70 px-1.5 rounded ml-1 gap-1'>
            <RiCommandLine className='size-3' />
            <span>I</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
