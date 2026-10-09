import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { RoomView } from '@/components/room/RoomView';

export const Route = createFileRoute('/room/$roomId/')({
  validateSearch: zodValidator(
    z.object({
      // set right after onboarding to show the first-room tips
      welcome: z.boolean().optional(),
    })
  ),
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
