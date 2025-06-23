import { RoomView } from '@/components/room/RoomView';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/room/$roomId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomView />;
}
