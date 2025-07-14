import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/query/client';
import { Toaster } from '@/components/ui/toast';
import { AuthContext } from '@/contexts/AuthContext';
import { CookiesProvider } from 'react-cookie';

interface RouterContext {
  queryClient: QueryClient;
  auth: Promise<AuthContext>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <QueryClientProvider client={TanstackQueryClient}>
        <CookiesProvider>
          <Outlet />
          <Toaster richColors />
          {/* <TanStackRouterDevtools /> */}
        </CookiesProvider>
      </QueryClientProvider>
    </>
  ),
});
