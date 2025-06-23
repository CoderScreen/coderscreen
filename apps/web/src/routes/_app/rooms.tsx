import { RoomListView } from '@/components/room-list/RoomListView';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/rooms')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomListView />;
}
