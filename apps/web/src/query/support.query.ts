import { useMutation } from '@tanstack/react-query';
import { throwApiError } from '@/query/error.query';
import { apiClient } from './client';

export const useSendSupportMessage = () => {
  const mutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      // `support` is typed off the built api dist; cast until types are regenerated
      const response = await (apiClient as any).support.$post({
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    meta: {
      SUCCESS_MESSAGE: 'Message sent — we’ll get back to you soon',
      ERROR_MESSAGE: 'Failed to send message',
    },
  });

  return {
    sendSupportMessage: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
