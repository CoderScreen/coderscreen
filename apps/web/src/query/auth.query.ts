import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authClient } from './client';

const APP_URL = import.meta.env.VITE_APP_URL;
if (!APP_URL) {
  throw new Error('VITE_APP_URL is not set');
}

// Get current user session
export const useSession = () => {
  const session = authClient.useSession();

  return {
    // biome-ignore lint/style/noNonNullAssertion: should be set because of our auth context
    user: session.data?.user!,
    // biome-ignore lint/style/noNonNullAssertion: should be set because of our auth context
    session: session.data?.session!,
    isLoading: session.isPending,
    error: session.error,
    refetch: session.refetch,
  };
};

export const useCurrentMember = () => {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ['member', user.id],
    queryFn: () => authClient.organization.getActiveMember(),
  });

  return {
    ...query,
    member: query.data?.data,
  };
};

// Sign up with email and password
export const useSignUp = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
      callbackURL,
    }: {
      email: string;
      password: string;
      callbackURL: string | undefined;
    }) => {
      const result = await authClient.signUp.email({
        name: email,
        email,
        password,
        callbackURL: `${APP_URL}${callbackURL ? callbackURL : ''}`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign up');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Account created successfully',
      ERROR_MESSAGE: 'Failed to create account',
    },
  });

  return {
    signUp: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Sign in with email and password
export const useSignIn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
      callbackURL,
    }: {
      email: string;
      password: string;
      callbackURL: string | undefined;
    }) => {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign in');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Signed in successfully',
      ERROR_MESSAGE: 'Failed to sign in',
    },
  });

  return {
    signIn: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Sign in with Google
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: { callbackURL: string | undefined }) => {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${APP_URL}${params.callbackURL ? params.callbackURL : ''}`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign in with Google');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      ERROR_MESSAGE: 'Failed to sign in with Google',
    },
  });

  return {
    signInWithGoogle: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Sign in with Github
export const useGithubSignIn = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: { callbackURL: string | undefined }) => {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: `${APP_URL}${params.callbackURL ? params.callbackURL : ''}`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign in with Github');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      ERROR_MESSAGE: 'Failed to sign in with Github',
    },
  });

  return {
    signInWithGithub: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Verify email
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.verifyEmail({
        query: {
          token,
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to verify email');
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Email verified successfully',
      ERROR_MESSAGE: 'Failed to verify email',
    },
  });

  return {
    verifyEmail: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Sign out
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign out');
      }

      return result;
    },
    onSuccess: () => {
      // Clear auth queries from cache
      queryClient.removeQueries({ queryKey: ['auth'] });
      navigate({ to: '/login' });
    },
    meta: {
      SUCCESS_MESSAGE: 'Signed out successfully',
      ERROR_MESSAGE: 'Failed to sign out',
    },
  });

  return {
    signOut: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
