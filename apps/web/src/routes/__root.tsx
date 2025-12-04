import { Toaster } from '@coderscreen/ui/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { CookiesProvider } from 'react-cookie';
import { AuthContext } from '@/contexts/AuthContext';
import { TanstackQueryClient } from '@/query/client';

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
          <Toaster
            richColors
            icons={{
              error: null,
            }}
            toastOptions={{
              classNames: {
                toast: '!w-full',
                content: '!w-full',
              },
            }}
          />
          {/* <TanStackRouterDevtools /> */}
        </CookiesProvider>
      </QueryClientProvider>
    </>
  ),
});
