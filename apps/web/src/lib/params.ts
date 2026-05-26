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

export const useCurrentSubId = (): string => {
  const params = useParams({ strict: false });

  if (!params.subId) {
    throw new Error('useCurrentSubId must be used within a route that has a subId param');
  }

  return params.subId;
};

export const useCurrentQuestionId = (): string => {
  const params = useParams({ strict: false });

  if (!params.questionId) {
    throw new Error('useCurrentQuestionId must be used within a route that has a questionId param');
  }

  return params.questionId;
};
