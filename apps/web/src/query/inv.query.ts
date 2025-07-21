import { authClient } from '@/query/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';

export const useInvitation = () => {
  const { invId } = useParams({ from: '/accept-invitation/$invId' });

  const query = useQuery({
    queryKey: ['invitation', invId],
    queryFn: () => {
      return authClient.organization.getInvitation({
        query: {
          id: invId,
        },
      });
    },
  });

  return {
    ...query,
    invitation: query.data?.data,
  };
};

export const useAcceptInvitation = () => {
  const { invId } = useParams({ from: '/accept-invitation/$invId' });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const invitation = await authClient.organization.acceptInvitation({
        invitationId: invId,
      });

      if (invitation.error) {
        throw new Error(invitation.error.message);
      }

      // await authClient.organization.setActive({
      //   organizationId: invitation.data.member.organizationId,
      // });

      navigate({ to: '/', reloadDocument: true });
    },
  });

  return {
    ...mutation,
    acceptInvitation: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
