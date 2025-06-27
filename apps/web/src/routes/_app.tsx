import { createFileRoute, redirect } from '@tanstack/react-router';
import Sidebar from '@/components/dashboard/Sidebar';
import { Outlet } from '@tanstack/react-router';
import { PendingView } from '@/components/common/PendingView';

export const Route = createFileRoute('/_app')({
  pendingComponent: () => <PendingView />,
  component: RouteComponent,
  wrapInSuspense: true,
  beforeLoad: async ({ context }) => {
    const { isAuthenticated } = await context.auth; // Call the function

    if (!isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

function RouteComponent() {
  return (
    <div className='flex h-screen w-full'>
      <Sidebar />
      <Outlet />
    </div>
  );
}
