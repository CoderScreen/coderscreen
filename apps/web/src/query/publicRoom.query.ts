import { RoomSchema } from '@coderscreen/api/schema/room';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCurrentRoomId } from '@/lib/params';
import { apiClient } from './client';

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
  const mutation = useMutation({
    mutationFn: async ({ language }: { language: RoomSchema['language'] }) => {
      const response = await apiClient.rooms[':roomId'].public.run.$post({
        param: { roomId: currentRoomId },
        json: { language },
      });
      return response.json();
    },
  });
  return { runRoomCode: mutation.mutateAsync, ...mutation };
};

export const useStopRoomCode = () => {
  const currentRoomId = useCurrentRoomId();
  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.rooms[':roomId'].public.stop.$post({
        param: { roomId: currentRoomId },
      });
    },
  });
  return { stopRoomCode: mutation.mutateAsync, ...mutation };
};
