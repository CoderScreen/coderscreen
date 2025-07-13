import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from './client';

// Get current user session
export const useSession = () => {
  const session = authClient.useSession();

  return {
    user: session.data?.user!,
    isLoading: session.isPending,
    error: session.error,
    refetch: session.refetch,
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
        callbackURL,
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
        callbackURL: params.callbackURL,
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
      SUCCESS_MESSAGE: 'Signed in with Google successfully',
      ERROR_MESSAGE: 'Failed to sign in with Google',
    },
  });

  return {
    signInWithGoogle: mutation.mutateAsync,
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
