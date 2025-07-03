import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';

export interface ConnectedUser {
  clientId: string;
  name: string;
  color: string;
}

export interface AwarenessState {
  user: {
    name: string;
    color: string;
  };
  cursor?: {
    index: number;
    length: number;
  };
  selection?: {
    anchor: number;
    head: number;
  };
}

export function useActiveUsers() {
  const { provider } = useRoomContext();
  const [activeUsers, setActiveUsers] = useState<ConnectedUser[]>([]);
  const [awarenessStates, setAwarenessStates] = useState<
    Map<number, AwarenessState>
  >(new Map());

  // Observe changes to awareness using provider.awareness
  useEffect(() => {
    if (!provider) return;

    const updateActiveUsers = () => {
      const states = provider.awareness.getStates();
      const newAwarenessStates = new Map<number, AwarenessState>();

      // Convert and validate awareness states
      states.forEach((state: any, clientId: number) => {
        if (state && typeof state === 'object' && state.user) {
          newAwarenessStates.set(clientId, state as AwarenessState);
        }
      });

      setAwarenessStates(newAwarenessStates);

      // Convert awareness states to connected users
      const users: ConnectedUser[] = Array.from(states.entries())
        .map(([clientId, awarenessState]) => {
          if (!awarenessState?.user) return null;

          return {
            clientId: clientId.toString(),
            name: awarenessState.user.name,
            color: awarenessState.user.color,
          };
        })
        .filter((user): user is ConnectedUser => user !== null);

      setActiveUsers(users);
    };

    // Set initial active users
    updateActiveUsers();

    // Observe changes to awareness
    provider.awareness.on('change', updateActiveUsers);

    return () => {
      provider.awareness.off('change', updateActiveUsers);
    };
  }, [provider]);

  // Update current user's awareness state
  const updateAwareness = useCallback(
    (awarenessState: Partial<AwarenessState>) => {
      if (!provider) return;

      const currentState = provider.awareness.getLocalState() || {};

      // Ensure we don't overwrite the user property if it's not provided
      const updatedState: AwarenessState = {
        ...currentState,
        ...awarenessState,
        user: awarenessState.user ||
          currentState.user || { name: '', color: '', id: '' },
      };

      provider.awareness.setLocalState(updatedState);
    },
    [provider]
  );

  // Set current user's information
  const setCurrentUser = useCallback(
    (user: { name: string; color: string; id: string }) => {
      if (!provider) return;

      updateAwareness({
        user,
      });
    },
    [provider, updateAwareness]
  );

  // Update cursor position
  const updateCursor = useCallback(
    (cursor: { index: number; length: number }) => {
      updateAwareness({ cursor });
    },
    [updateAwareness]
  );

  // Update text selection
  const updateSelection = useCallback(
    (selection: { anchor: number; head: number }) => {
      updateAwareness({ selection });
    },
    [updateAwareness]
  );

  // Get unique users by email (in case of multiple connections)
  const uniqueUsers = activeUsers.reduce(
    (acc: ConnectedUser[], user: ConnectedUser) => {
      if (!acc.find((u: ConnectedUser) => u.clientId === user.clientId)) {
        acc.push(user);
      }
      return acc;
    },
    [] as ConnectedUser[]
  );

  // Get current user's awareness state
  const currentUserState = provider ? provider.awareness.getLocalState() : null;

  return {
    activeUsers,
    uniqueUsers,
    awarenessStates,
    currentUserState,
    setCurrentUser,
    updateCursor,
    updateSelection,
    updateAwareness,
    provider,
  };
}
