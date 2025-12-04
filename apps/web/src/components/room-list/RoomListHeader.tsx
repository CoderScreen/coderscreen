import { SmallHeader } from '@coderscreen/ui/heading';

export function RoomListHeader() {
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
