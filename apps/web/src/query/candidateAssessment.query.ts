import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export const useCandidateAssessment = (subId: string, token: string) => {
  const query = useQuery({
    queryKey: ['candidate-assessment', subId, token],
    queryFn: async () => {
      const response = await apiClient.assessments[':subId'].take.$get({
        param: { subId },
        query: { token },
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    enabled: !!subId && !!token,
    retry: false,
  });

  return {
    ...query,
    data: query.data,
  };
};

export const useStartAssessment = (subId: string, token: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      selectedLanguage,
      enteredName,
    }: {
      selectedLanguage: string;
      enteredName: string;
    }) => {
      const response = await apiClient.assessments[':subId'].take.start.$post({
        param: { subId },
        query: { token },
        json: { selectedLanguage: selectedLanguage as any, enteredName },
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-assessment', subId, token] });
    },
    meta: {
      ERROR_MESSAGE: 'Failed to start assessment',
    },
  });

  return {
    startAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useSaveCode = (subId: string, token: string) => {
  const mutation = useMutation({
    mutationFn: async ({ questionId, code }: { questionId: string; code: string }) => {
      const response = await apiClient.assessments[':subId'].take.save.$post({
        param: { subId },
        query: { token },
        json: { questionId: questionId as any, code },
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    // Silent — no toasts for auto-save
  });

  return {
    saveCode: mutation.mutateAsync,
    isSaving: mutation.isPending,
    ...mutation,
  };
};

export const useRunTests = (subId: string, token: string) => {
  const mutation = useMutation({
    mutationFn: async ({ questionId, code }: { questionId: string; code: string }) => {
      const response = await apiClient.assessments[':subId'].take.run.$post({
        param: { subId },
        query: { token },
        json: { questionId: questionId as any, code },
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to run tests',
    },
  });

  return {
    runTests: mutation.mutateAsync,
    isRunning: mutation.isPending,
    ...mutation,
  };
};

export const useSubmitAssessment = (subId: string, token: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.assessments[':subId'].take.submit.$post({
        param: { subId },
        query: { token },
      });
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-assessment', subId, token] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment submitted',
      ERROR_MESSAGE: 'Failed to submit assessment',
    },
  });

  return {
    submitAssessment: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    ...mutation,
  };
};
