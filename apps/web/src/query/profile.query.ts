import { authClient } from '@/query/client';
import { useMutation } from '@tanstack/react-query';

export const useUpdateUser = () => {
  const mutation = useMutation({
    mutationFn: async (params: { name: string }) => {
      const result = await authClient.updateUser({
        name: params.name,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update user');
      }

      return result;
    },
    meta: {
      SUCCESS_MESSAGE: 'Profile updated successfully',
      ERROR_MESSAGE: 'Failed to update profile',
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
