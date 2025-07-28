import { createRouter, RouterProvider } from '@tanstack/react-router';
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

const authClient = Promise.withResolvers<AuthContext>();

function InnerApp() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isInitalLoading) {
      return;
    }

    authClient.resolve(auth);
  }, [auth, auth.isInitalLoading]);

  return <RouterProvider router={router} context={{ auth: authClient.promise }} />;
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
