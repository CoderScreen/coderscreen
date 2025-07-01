import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useCurrentRoomId } from '@/lib/params';
import { RoomSchema } from '@coderscreen/api/schema/room';
import { useRouter } from '@tanstack/react-router';

// Get all rooms
export const useRooms = () => {
  const query = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.rooms.$get();
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch rooms',
    },
  });

  return {
    rooms: query.data,
    ...query,
  };
};

// Get a specific room
export const useRoom = () => {
  const id = useCurrentRoomId();

  const query = useQuery({
    queryKey: ['rooms', id],
    queryFn: async () => {
      const response = await apiClient.rooms[':id'].$get({
        param: { id },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch room',
    },
  });

  return {
    room: query.data,
    ...query,
  };
};

// Create a new room
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      data: Omit<RoomSchema, 'id' | 'createdAt' | 'updatedAt' | 'status'>
    ) => {
      const response = await apiClient.rooms.$post({
        json: data,
      });
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    meta: {
      // SUCCESS_MESSAGE: 'Room created successfully',
      ERROR_MESSAGE: 'Failed to create room',
    },
  });

  return {
    createRoom: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Update a room
export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RoomSchema>;
    }) => {
      const response = await apiClient.rooms[':id'].$patch({
        param: { id },
        json: data,
      });
      if (!response.ok) {
        throw new Error('Failed to update room');
      }
      return response.json();
    },
    onSuccess: (data, { id }) => {
      console.log('onSuccess', data, id);
      // Update the specific room in cache
      queryClient.setQueryData(['rooms', id], data);

      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Room updated successfully',
      ERROR_MESSAGE: 'Failed to update room',
    },
  });

  return {
    updateRoom: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// Delete a room
export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.rooms[':id'].$delete({
        param: { id },
      });
      if (!response.ok) {
        throw new Error('Failed to delete room');
      }
      return response.json();
    },
    onSuccess: (_, id) => {
      // Remove the room from cache
      queryClient.removeQueries({ queryKey: ['rooms', id] });
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Room deleted successfully',
      ERROR_MESSAGE: 'Failed to delete room',
    },
  });
};

export const useRoomCodeResult = () => {
  const currentRoomId = useCurrentRoomId();

  const query = useQuery<{ codeOutput: string }>({
    queryKey: ['rooms', currentRoomId, 'codeResult'],
    enabled: false,
  });

  return {
    roomCodeResult: query.data,
  };
};

export const useEndRoom = () => {
  const router = useRouter();
  const currentRoomId = useCurrentRoomId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.rooms[':id'].end.$post({
        param: { id: currentRoomId },
      });
      if (!response.ok) {
        throw new Error('Failed to end room');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', currentRoomId] });
      router.navigate({
        to: '/room/$roomId/summary',
        params: { roomId: currentRoomId },
      });
    },
    meta: {
      SUCCESS_MESSAGE: 'Room ended successfully',
      ERROR_MESSAGE: 'Failed to end room',
    },
  });
  return {
    endRoom: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
