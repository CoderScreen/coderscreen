import { authClient } from '@/query/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useInvitations = () => {
  const query = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await authClient.organization.listInvitations();

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
  });

  return {
    invitations: query.data,
    ...query,
  };
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      email: string;
      role: 'member' | 'admin' | 'owner';
      resend?: boolean;
    }) => {
      const response = await authClient.organization.inviteMember(data);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (newInvitation) => {
      queryClient.setQueryData(['invitations'], (oldInvitations: any[] | undefined) => [
        ...(oldInvitations ?? []),
        newInvitation,
      ]);
    },
    meta: {
      SUCCESS_MESSAGE: 'Invitation sent successfully',
    },
  });

  return {
    inviteMember: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await authClient.organization.cancelInvitation({ invitationId });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (invitation) => {
      queryClient.setQueryData(['invitations'], (oldInvitations: any[] | undefined) =>
        oldInvitations?.filter((i) => i.id !== invitation.id)
      );
    },
    meta: {
      SUCCESS_MESSAGE: 'Invitation cancelled successfully',
    },
  });

  return {
    cancelInvitation: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
