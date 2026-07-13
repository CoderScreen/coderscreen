import * as Sentry from '@sentry/react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Agentation } from 'agentation';
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts';

import './App.css';
import NotFound from '@/components/common/NotFound.tsx';
import { PendingView } from '@/components/common/PendingView.tsx';
import { AuthContext, AuthProvider, useAuth } from '@/contexts/AuthContext.tsx';
import { TanstackQueryClient } from '@/query/client.ts';
import reportWebVitals from './reportWebVitals.ts';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient: TanstackQueryClient,
    auth: undefined as unknown as Promise<AuthContext>, // This will be set after we wrap the app in an AuthProvider
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <NotFound />,
  defaultPendingComponent: () => <PendingView />,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Initialize Sentry error tracking. Disabled in local dev (MODE === 'development').
// The DSN is baked in at build time via `import.meta.env.VITE_SENTRY_DSN`.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.MODE !== 'development' && Boolean(import.meta.env.VITE_SENTRY_DSN),
  integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
  // Performance tracing sample rate. Tune as needed.
  tracesSampleRate: 0.1,
  sendDefaultPii: true,
});

const authClient = Promise.withResolvers<AuthContext>();

function InnerApp() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isInitalLoading) {
      return;
    }

    // Tie Sentry events to the current user (cleared on sign-out).
    Sentry.setUser(auth.user ? { id: auth.user.id, email: auth.user.email } : null);

    authClient.resolve(auth);
  }, [auth, auth.isInitalLoading]);

  return <RouterProvider router={router} context={{ auth: authClient.promise }} />;
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
      {process.env.NODE_ENV === 'development' && <Agentation endpoint='http://localhost:4747' />}
    </AuthProvider>
  );
}

function ErrorFallback() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center'>
      <h1 className='text-lg font-semibold'>Something went wrong</h1>
      <p className='text-sm text-gray-500'>
        An unexpected error occurred and has been reported. Please try reloading the page.
      </p>
      <button
        type='button'
        onClick={() => window.location.reload()}
        className='rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
      >
        Reload
      </button>
    </div>
  );
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
