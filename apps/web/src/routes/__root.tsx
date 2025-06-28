import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/query/client';
import { Toaster } from '@/components/ui/toast';
import { AuthContext } from '@/contexts/AuthContext';

interface RouterContext {
  queryClient: QueryClient;
  auth: Promise<AuthContext>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <QueryClientProvider client={TanstackQueryClient}>
        <Outlet />
        <Toaster richColors />
        {/* <TanStackRouterDevtools /> */}
      </QueryClientProvider>
    </>
  ),
});
