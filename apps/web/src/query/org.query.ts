import { apiClient, authClient } from '@/query/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import { useSession } from '@/query/auth.query';

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

      queryClient.invalidateQueries();
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
    mutationFn: async (params: { name: string; slug: string; goal?: string }) => {
      const data = await authClient.organization.create({
        ...params,
        metadata: {
          goal: params.goal,
        },
      });

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

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: { name: string; logo?: string }) => {
      // check if we need to upload the logo
      const logo = await (async () => {
        if (!params.logo) {
          return undefined;
        }

        const response = await apiClient.assets.logo.$put({
          json: {
            data: params.logo,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to upload logo');
        }

        const data = await response.json();
        return data.url;
      })();

      const data = await authClient.organization.update({
        data: {
          ...params,
          logo,
        },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch active organization
      queryClient.invalidateQueries({ queryKey: ['activeOrganization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Organization updated successfully',
      ERROR_MESSAGE: 'Failed to update organization',
    },
  });

  return {
    updateOrganization: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  const { session } = useSession();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session.activeOrganizationId) {
        throw new Error('No organization ID found');
      }

      const data = await authClient.organization.delete({
        organizationId: session.activeOrganizationId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrganization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Organization deleted successfully',
      ERROR_MESSAGE: 'Failed to delete organization',
    },
  });

  return {
    deleteOrganization: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
