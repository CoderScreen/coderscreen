import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableRoot,
  TableSkeleton,
} from '@/components/ui/table';
import { RoomSchema } from '@coderscreen/api/schema/room';
import { formatRelativeDatetime } from '@/lib/dateUtils';
import { LanguageIcon } from '@/components/common/LanguageIcon';
import { formatSlug } from '@/lib/slug';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuIconWrapper,
} from '@/components/ui/dropdown';
import {
  RiEditLine,
  RiEyeLine,
  RiMore2Line,
  RiMoreLine,
  RiLink,
  RiFileCopyLine,
  RiDeleteBinLine,
  RiArrowRightLine,
  RiCornerDownRightLine,
} from '@remixicon/react';
import { Link } from '@tanstack/react-router';
import { siteConfig } from '@/lib/siteConfig';

interface RoomTableProps {
  rooms: RoomSchema[];
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
  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(roomUrl);
    // You might want to add a toast notification here
  };

  const handleDuplicateRoom = () => {
    // TODO: Implement duplicate room functionality
    console.log('Duplicate room:', room.id);
  };

  const handleDeleteRoom = () => {
    // TODO: Implement delete room functionality
    console.log('Delete room:', room.id);
  };

  return (
    <div className='flex items-center gap-2'>
      <Link to={'/rooms'}>
        <Button
          variant='secondary'
          icon={RiCornerDownRightLine}
          iconPosition='right'
        >
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

export function RoomTable({ rooms, isLoading }: RoomTableProps) {
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
          ) : (
            rooms.map((room) => (
              <TableRow key={room.id} className='odd:bg-muted/50 group'>
                <TableCell className='flex items-center gap-2'>
                  <Checkbox />
                  {room.title}
                </TableCell>
                <TableCell>
                  <StatusBadge status={room.status} />
                </TableCell>
                <TableCell>{formatRelativeDatetime(room.createdAt)}</TableCell>
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
