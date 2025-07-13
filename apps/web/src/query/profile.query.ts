import { authClient } from '@/query/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateUser = (options?: { hideSuccessMessage?: boolean }) => {
  const mutation = useMutation({
    mutationFn: async (params: { name: string; persona?: string }) => {
      const result = await authClient.updateUser(params);

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update user');
      }

      return result;
    },
    meta: {
      SUCCESS_MESSAGE: options?.hideSuccessMessage ? undefined : 'Profile updated successfully',
      ERROR_MESSAGE: 'Failed to update profile',
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.deleteUser();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete user');
      }

      return result;
    },
    onSuccess: () => {
      // Clear auth queries from cache
      queryClient.clear();
    },
    meta: {
      SUCCESS_MESSAGE: 'Account deleted successfully',
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
