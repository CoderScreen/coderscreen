import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { throwApiError } from '@/query/error.query';
import { apiClient } from './client';

const API_KEYS_QUERY_KEY = ['api-keys'];

// List API keys for the active organization
export const useApiKeys = () => {
  const query = useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient['api-keys'].$get();
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch API keys',
    },
  });

  return {
    apiKeys: query.data,
    ...query,
  };
};

// Create a new API key. The plaintext key is only returned here, once.
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string; expiresInDays?: number }) => {
      const response = await apiClient['api-keys'].$post({ json: data });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
    meta: {
      ERROR_MESSAGE: 'Failed to create API key',
    },
  });

  return {
    createApiKey: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Revoke an API key
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient['api-keys'][':id'].$delete({ param: { id } });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
    meta: {
      SUCCESS_MESSAGE: 'API key revoked',
      ERROR_MESSAGE: 'Failed to revoke API key',
    },
  });

  return {
    revokeApiKey: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
