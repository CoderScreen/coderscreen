import { createFileRoute } from '@tanstack/react-router';
import { RoomView } from '@/components/room/RoomView';

export const Route = createFileRoute('/room/$roomId/')({
  beforeLoad: async ({ params }) => {
    // Room is accessible to both authenticated and unauthenticated users
    // Authentication check is handled within the RoomView component
    console.log('Accessing room:', params.roomId);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomView />;
}
