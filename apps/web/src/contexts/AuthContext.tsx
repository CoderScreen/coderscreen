import * as React from 'react';

import { authClient } from '@/query/client';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    isOnboarded: boolean;
  } | null;
  session: {
    id: string;
    activeOrganizationId: string | null;
  } | null;
  isAuthenticated: boolean;
  isInitalLoading: boolean;
  error: Error | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, error } = authClient.useSession();

  const user = data?.user
    ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email,
        // @ts-ignore
        isOnboarded: !!data.user.isOnboarded,
      }
    : null;

  const session = data
    ? {
        id: data.session.id,
        activeOrganizationId: data.session.activeOrganizationId ?? null,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: data !== null,
        isInitalLoading: isPending,
        error,
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
