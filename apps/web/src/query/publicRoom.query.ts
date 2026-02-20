import { RoomSchema } from '@coderscreen/api/schema/room';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
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

export const useRunRoomCode = () => {
  const currentRoomId = useCurrentRoomId();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: RoomSchema['language'] }) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await apiClient.rooms[':roomId'].public.run.$post(
        {
          param: { roomId: currentRoomId },
          json: { code, language },
        },
        { init: { signal: controller.signal } }
      );
      if (!response.ok) {
        throw new Error('Failed to run room code');
      }
      return response.json();
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['rooms', currentRoomId, 'codeResult'], data);
    },
    meta: {
      ERROR_MESSAGE: 'Failed to run room code',
    },
  });

  const abortRun = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    runRoomCode: mutation.mutateAsync,
    abortRun,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
