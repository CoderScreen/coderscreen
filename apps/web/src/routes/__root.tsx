import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/query/client';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={TanstackQueryClient}>
        <Outlet />
        <Toaster />
        <TanStackRouterDevtools />
      </QueryClientProvider>
    </>
  ),
});
