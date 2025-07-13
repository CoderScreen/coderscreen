import { useEffect, useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';

export interface TrackedUser {
  id: string;
  name: string;
  color: string;
  joinedAt?: Date;
}

const KEYS = {
  trackedUsers: 'tracked-users',
};

export function useTrackedUsers() {
  const { provider } = useRoomContext();
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);

  // Observe changes to tracked users in the Y.js document
  useEffect(() => {
    if (!provider) return;

    const trackedUsersArray = provider.doc.getArray<TrackedUser>(KEYS.trackedUsers);

    const updateTrackedUsers = () => {
      const users = trackedUsersArray.toArray();
      setTrackedUsers(users);
    };

    // Set initial tracked users
    updateTrackedUsers();

    // Observe changes to tracked users
    trackedUsersArray.observe(updateTrackedUsers);

    return () => {
      trackedUsersArray.unobserve(updateTrackedUsers);
    };
  }, [provider]);

  return {
    trackedUsers,
  };
}
