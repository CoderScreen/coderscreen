import { createFileRoute } from '@tanstack/react-router';
import { RoomListView } from '@/components/room-list/RoomListView';

export const Route = createFileRoute('/_app/rooms')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomListView />;
}
