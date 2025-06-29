import { createFileRoute } from '@tanstack/react-router';
import { ProfileView } from '@/components/profile/ProfileView';

export const Route = createFileRoute('/_app/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfileView />;
}
