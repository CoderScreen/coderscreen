import { authClient } from '@/query/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';

export const useActiveOrg = () => {
  const { data, isPending, error } = authClient.useActiveOrganization();

  return {
    org: data,
    isLoading: isPending,
    error,
  };
};

export const useUserOrgs = () => {
  const { data, isPending, error } = authClient.useListOrganizations();

  return {
    orgs: data,
    isLoading: isPending,
    error,
  };
};

export const useSwitchOrganization = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const data = await authClient.organization.setActive({
        organizationId,
      });
      return data;
    },
    onSuccess: async () => {
      // Navigate to home page after switching
      await router.navigate({ to: '/' });

      queryClient.clear();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to switch organization',
    },
  });

  return {
    switchOrganization: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

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
