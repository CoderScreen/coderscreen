import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { PendingView } from '@/components/common/PendingView';
import Sidebar from '@/components/common/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';

export const Route = createFileRoute('/_app')({
  pendingComponent: () => <PendingView />,
  component: RouteComponent,
  wrapInSuspense: true,
  beforeLoad: async ({ context, location }) => {
    const { user, session, isAuthenticated } = await context.auth; // Call the function

    if (!isAuthenticated || !user) {
      throw redirect({ to: '/login', search: { callbackUrl: location.href } });
    }

    // if user is not onboarded, redirect to onboarding page
    if (!user.isOnboarded) {
      throw redirect({ to: '/onboarding' });
    }

    // if user has no active organization, redirect to choose org page
    if (!session?.activeOrganizationId) {
      throw redirect({ to: '/organizations' });
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
