import { authClient } from '@/query/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';

export const useCreateOrganization = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (params: { name: string; slug: string }) => {
      const data = await authClient.organization.create(params);

      return data;
    },
    onSuccess: async (response) => {
      if (!response.data) {
        toast.error('Failed to create organization');
        return;
      }

      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });

      await router.navigate({ to: '/' });
    },
  });

  return {
    createOrganization: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
