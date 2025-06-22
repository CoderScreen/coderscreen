import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { useCreateRoom } from '@/query/room.query';
import { RiAddLine } from '@remixicon/react';

export function DashboardHeader() {
  const { createRoom, isLoading } = useCreateRoom();

  const handleCreateRoom = async () => {
    const randomTitle = `Room: ${Math.random().toString(36).substring(2, 15)}`;

    await createRoom({
      language: 'typescript',
      status: 'scheduled',
      title: randomTitle,
    });
  };

  return (
    <div className='h-16 flex items-center justify-between px-4'>
      <div className='flex items-center gap-2'>
        <SmallHeader>Dashboard</SmallHeader>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          icon={RiAddLine}
          isLoading={isLoading}
          onClick={handleCreateRoom}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
}
