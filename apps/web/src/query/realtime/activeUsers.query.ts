import { useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { User } from '@/query/realtime/chat.query';

const KEYS = {
  trackedUsers: 'tracked-users',
};

export function useActiveUsers() {
  const { provider } = useRoomContext();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);

  // Observe changes to awareness using provider.awareness
  useEffect(() => {
    if (!provider) return;

    const updateActiveUsers = () => {
      const states = provider.awareness.getStates();

      // Convert awareness states to connected users
      const users: User[] = Array.from(states.entries())
        .map(([_, awarenessState]) => {
          if (!awarenessState?.user) return null;

          return awarenessState.user;
        })
        .filter((user): user is User => user !== null);

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

  // Observe changes to tracked users in the Y.js document
  useEffect(() => {
    if (!provider) return;

    const trackedUsersArray = provider.doc.getArray<User>(KEYS.trackedUsers);

    const updateTrackedUsers = () => {
      const users = trackedUsersArray.toArray();

      // Separate active and inactive users
      const activeUserIds = new Set(activeUsers.map((user) => user.id));
      const activeTrackedUsers = users.filter(
        (user) =>
          activeUserIds.has(user.id) ||
          activeUsers.some((activeUser) => activeUser.name === user.name)
      );
      const inactiveTrackedUsers = users.filter(
        (user) =>
          !activeUserIds.has(user.id) &&
          !activeUsers.some((activeUser) => activeUser.name === user.name)
      );

      setInactiveUsers(inactiveTrackedUsers);
    };

    // Set initial tracked users
    updateTrackedUsers();

    // Observe changes to tracked users
    trackedUsersArray.observe(updateTrackedUsers);

    return () => {
      trackedUsersArray.unobserve(updateTrackedUsers);
    };
  }, [provider, activeUsers]);

  return {
    activeUsers,
    inactiveUsers,
  };
}
