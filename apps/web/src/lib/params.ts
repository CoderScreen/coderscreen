import { useParams } from '@tanstack/react-router';

export const useCurrentRoomId = (): string => {
  const params = useParams({ strict: false });

  if (!params.roomId) {
    throw new Error('useCurrentRoomId must be used within a route that has a roomId param');
  }

  return params.roomId;
};

export const useCurrentAssessmentId = (): string => {
  const params = useParams({ strict: false });

  if (!params.assessmentId) {
    throw new Error('useCurrentAssessmentId must be used within a route that has an assessmentId param');
  }

  return params.assessmentId;
};
