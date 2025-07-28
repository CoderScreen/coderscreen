import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/query/client';

export const useUploadLogo = () => {
  const mutation = useMutation({
    mutationFn: async (base64: string) => {
      const response = await apiClient.assets.logo.$put({
        json: {
          data: base64,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      return await response.json();
    },
  });

  return {
    uploadLogo: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
