import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Invitation } from 'better-auth/plugins/organization';
import { useSession } from '@/query/auth.query';
import { authClient } from '@/query/client';

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
      queryClient.setQueryData(['invitations'], (oldInvitations: Invitation[] | undefined) => [
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
      queryClient.setQueryData(['invitations'], (oldInvitations: Invitation[] | undefined) =>
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

export const useRemoveMember = () => {
  const { session } = useSession();

  const mutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!session.activeOrganizationId) {
        throw new Error('No organization ID found');
      }

      const response = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: session.activeOrganizationId,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
  });

  return {
    removeMember: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
