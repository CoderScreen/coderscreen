import { Outlet, createRootRoute } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { TanstackQueryClient } from '@/query/client';
import { Toaster } from '@/components/ui/toast';

// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
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
