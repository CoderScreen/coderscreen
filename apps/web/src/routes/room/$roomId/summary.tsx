import { createFileRoute } from '@tanstack/react-router';
import { RoomSummaryView } from '@/components/room/summary/RoomSummaryView';
export const Route = createFileRoute('/room/$roomId/summary')({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoomSummaryView />;
}
