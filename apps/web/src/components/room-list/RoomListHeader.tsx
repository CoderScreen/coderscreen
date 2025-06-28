import { Button } from '@/components/ui/button';
import { SmallHeader } from '@/components/ui/heading';
import { useCreateRoom } from '@/query/room.query';
import { RiAddLine } from '@remixicon/react';

export function RoomListHeader() {
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
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <SmallHeader>Rooms</SmallHeader>
      </div>

      {/* <div className='flex items-center gap-2'>
        <Button
          icon={RiAddLine}
          isLoading={isLoading}
          onClick={handleCreateRoom}
        >
          Create Room
        </Button>
      </div> */}
    </div>
  );
}
