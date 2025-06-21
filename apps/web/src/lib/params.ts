import { useParams } from '@tanstack/react-router';

export const useCurrentRoomId = (): string => {
  const params = useParams({ strict: false });

  if (!params.id) {
    throw new Error(
      'useCurrentRoomId must be used within a route that has a id param'
    );
  }

  return params.id;
};
