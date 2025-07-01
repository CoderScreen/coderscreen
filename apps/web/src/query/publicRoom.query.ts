import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useCurrentRoomId } from '@/lib/params';

export const usePublicRoom = () => {
  const currentRoomId = useCurrentRoomId();
  const query = useQuery({
    queryKey: ['rooms', 'public', currentRoomId],
    queryFn: async () => {
      const response = await apiClient.rooms[':roomId'].public.$get({
        param: { roomId: currentRoomId },
      });
      return response.json();
    },
  });

  return {
    publicRoom: query.data,
    ...query,
  };
};

export const useRunRoomCode = () => {
  const currentRoomId = useCurrentRoomId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      code,
      language,
    }: {
      code: string;
      language: string;
    }) => {
      const response = await apiClient.rooms[':roomId'].public.run.$post({
        param: { roomId: currentRoomId },
        json: { code, language },
      });
      if (!response.ok) {
        throw new Error('Failed to run room code');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['rooms', currentRoomId, 'codeResult'], data);
    },
    meta: {
      // SUCCESS_MESSAGE: 'Room code run successfully',
      ERROR_MESSAGE: 'Failed to run room code',
    },
  });
  return {
    runRoomCode: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
