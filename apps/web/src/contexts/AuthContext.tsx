import * as React from 'react';

import { authClient } from '@/query/client';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    isOnboarded: boolean;
  } | null;
  isAuthenticated: boolean;
  isInitalLoading: boolean;
  error: Error | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();

  const user = session.data?.user
    ? {
        id: session.data.user.id,
        email: session.data.user.email,
        name: session.data.user.name || session.data.user.email,
        // @ts-ignore
        isOnboarded: !!session.data.user.isOnboarded,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: session.data !== null,
        isInitalLoading: session.isPending,
        error: session.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = React.useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return auth;
}
