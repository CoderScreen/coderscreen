import { RoomView } from '@/components/room/RoomView';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/room')({
  component: RoomPage,
});

function RoomPage() {
  return <RoomView />;
}
