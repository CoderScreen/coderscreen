import { RoomSchema } from '@coderscreen/api/schema/room';
import { Badge } from '@coderscreen/ui/badge';
import { Button } from '@coderscreen/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@coderscreen/ui/dropdown';
import { SmallHeader } from '@coderscreen/ui/heading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
  TableSkeleton,
} from '@coderscreen/ui/table';
import { Tooltip } from '@coderscreen/ui/tooltip';
import { MutedText } from '@coderscreen/ui/typography';
import {
  RiAddLine,
  RiCornerDownRightLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiLink,
  RiMore2Line,
  RiSearchLine,
} from '@remixicon/react';
import { Link, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { EmptyStateIcon } from '@/components/common/EmptyStateIcon';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { Shortcut } from '@/components/common/Shortcut';
import { formatDatetime, formatRelativeDatetime } from '@/lib/dateUtils';
import { formatSlug } from '@/lib/slug';
import { useCreateRoom, useDeleteRoom } from '@/query/room.query';

interface RoomTableProps {
  rooms: RoomSchema[];
  noRooms: boolean;
  isLoading?: boolean;
}

const StatusBadge = ({ status }: { status: RoomSchema['status'] }) => {
  switch (status) {
    case 'active':
      return <Badge variant='success'>Active</Badge>;
    case 'completed':
      return <Badge variant='error'>Completed</Badge>;
    case 'scheduled':
      return <Badge variant='warning'>Scheduled</Badge>;
    case 'archived':
      return <Badge variant='neutral'>Archived</Badge>;
    default:
      return <Badge variant='neutral'>Unknown</Badge>;
  }
};

const RowActions = ({ room }: { room: RoomSchema }) => {
  const { deleteRoom } = useDeleteRoom();

  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(roomUrl);

    toast.success('Room link copied to clipboard');
  };

  const handleDuplicateRoom = () => {
    // TODO: Implement duplicate room functionality
    console.log('Duplicate room:', room.id);
  };

  const handleDeleteRoom = async () => {
    await deleteRoom(room.id);
  };

  return (
    <div className='flex items-center gap-2'>
      <Link to={'/room/$roomId'} params={{ roomId: room.id }}>
        <Button variant='secondary' icon={RiCornerDownRightLine} iconPosition='right'>
          Enter
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='icon' icon={RiMore2Line} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handleCopyLink}>
            <DropdownMenuIconWrapper>
              <RiLink className='size-4' />
            </DropdownMenuIconWrapper>
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicateRoom}>
            <DropdownMenuIconWrapper>
              <RiFileCopyLine className='size-4' />
            </DropdownMenuIconWrapper>
            Duplicate room
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteRoom}
            className='text-red-600 focus:text-red-600 focus:bg-red-50'
          >
            <DropdownMenuIconWrapper className='text-red-600'>
              <RiDeleteBinLine className='size-4' />
            </DropdownMenuIconWrapper>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function RoomTable({ rooms, isLoading, noRooms }: RoomTableProps) {
  return (
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Created</TableHeaderCell>
            <TableHeaderCell>Language</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton numRows={10} numCols={4} />
          ) : rooms.length === 0 ? (
            <EmptyTable noRooms={noRooms} />
          ) : (
            rooms.map((room) => (
              <TableRow key={room.id} className='group'>
                <TableCell className='flex items-center gap-2'>
                  {/* <Checkbox /> */}
                  {room.title}
                </TableCell>
                <TableCell>
                  <StatusBadge status={room.status} />
                </TableCell>
                <TableCell>
                  <Tooltip content={formatDatetime(room.createdAt)}>
                    {formatRelativeDatetime(room.createdAt)}
                  </Tooltip>
                </TableCell>
                <TableCell className='flex justify-between items-center gap-2 mr-4'>
                  <span className='flex items-center gap-1'>
                    <LanguageIcon language={room.language} />
                    {formatSlug(room.language)}
                  </span>

                  <RowActions room={room} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableRoot>
  );
}

const EmptyTable = ({ noRooms }: { noRooms: boolean }) => {
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

  if (noRooms) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <div className='flex flex-col items-center justify-center py-16 px-4'>
            <EmptyStateIcon icon={RiAddLine} />
            <SmallHeader className='mt-4'>No interviews yet</SmallHeader>
            <MutedText>
              You don't have any interviews yet. Create a new interview to get started.
            </MutedText>
            <Button
              variant='primary'
              icon={RiAddLine}
              className='mt-4'
              onClick={handleCreateRoom}
              isLoading={isLoading}
            >
              New interview
              <Shortcut _key='C' />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // If there are rooms but filters return no results
  return (
    <TableRow>
      <TableCell colSpan={4}>
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <EmptyStateIcon icon={RiSearchLine} />
          <SmallHeader className='mt-4'>No interviews match your filters</SmallHeader>
          <MutedText>
            Try adjusting your search criteria or filters to find the interviews you're looking for.
          </MutedText>
        </div>
      </TableCell>
    </TableRow>
  );
};
