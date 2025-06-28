import { createFileRoute, redirect } from '@tanstack/react-router';
import Sidebar from '@/components/common/Sidebar';
import { Outlet } from '@tanstack/react-router';
import { PendingView } from '@/components/common/PendingView';
import { SidebarProvider } from '@/contexts/SidebarContext';

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
      <SidebarProvider>
        <Sidebar />
        <div className='flex-1 overflow-y-auto'>
          <Outlet />
        </div>
      </SidebarProvider>
    </div>
  );
}
