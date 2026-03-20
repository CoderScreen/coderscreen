import type {
  CreateAssessmentSchema,
  CreateCandidateSchema,
  CreateQuestionSchema,
  CreateSubmissionSchema,
  CreateTestCaseSchema,
  GradeSubmissionSchema,
  UpdateAssessmentSchema,
  UpdateQuestionSchema,
  UpdateTestCaseSchema,
} from '@coderscreen/api/schema/assessment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { throwApiError } from '@/query/error.query';
import { apiClient } from './client';

// ============================================================
// Assessments
// ============================================================

export const useAssessments = (page = 1, limit = 20) => {
  const query = useQuery({
    queryKey: ['assessments', { page, limit }],
    queryFn: async () => {
      const response = await apiClient.assessments.$get({
        query: { page: String(page), limit: String(limit) },
      } as any);
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      return response.json() as Promise<{
        data: any[];
        pagination: { page: number; limit: number; totalCount: number; totalPages: number };
      }>;
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch assessments',
    },
  });

  return {
    assessments: query.data?.data,
    pagination: query.data?.pagination,
    ...query,
  };
};

export const useAssessment = (id: string, questionsPage?: number, questionsLimit?: number) => {
  const query = useQuery({
    queryKey: ['assessments', id, { questionsPage, questionsLimit }],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (questionsPage) queryParams.page = String(questionsPage);
      if (questionsLimit) queryParams.limit = String(questionsLimit);

      const response = await apiClient.assessments[':id'].$get({
        param: { id },
        ...(Object.keys(queryParams).length > 0 ? { query: queryParams } : {}),
      } as any);
      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }
      return response.json();
    },
    enabled: !!id,
    meta: {
      ERROR_MESSAGE: 'Failed to fetch assessment',
    },
  });

  return {
    assessment: query.data,
    ...query,
  };
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateAssessmentSchema) => {
      const response = await apiClient.assessments.$post({
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment created',
      ERROR_MESSAGE: 'Failed to create assessment',
    },
  });

  return {
    createAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssessmentSchema }) => {
      const response = await apiClient.assessments[':id'].$patch({
        param: { id },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assessments', id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment updated',
      ERROR_MESSAGE: 'Failed to update assessment',
    },
  });

  return {
    updateAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.assessments[':id'].$delete({
        param: { id },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['assessments', id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment deleted',
      ERROR_MESSAGE: 'Failed to delete assessment',
    },
  });

  return {
    deleteAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const usePublishAssessment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.assessments[':id'].publish.$post({
        param: { id },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['assessments', id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment published',
      ERROR_MESSAGE: 'Failed to publish assessment',
    },
  });

  return {
    publishAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useArchiveAssessment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.assessments[':id'].archive.$post({
        param: { id },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['assessments', id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Assessment archived',
      ERROR_MESSAGE: 'Failed to archive assessment',
    },
  });

  return {
    archiveAssessment: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// ============================================================
// Questions
// ============================================================

export const useCreateQuestion = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateQuestionSchema) => {
      const response = await apiClient.assessments[':id'].questions.$post({
        param: { id: assessmentId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Question added',
      ERROR_MESSAGE: 'Failed to add question',
    },
  });

  return {
    createQuestion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useUpdateQuestion = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      questionId,
      data,
    }: {
      questionId: string;
      data: UpdateQuestionSchema;
    }) => {
      const response = await apiClient.assessments[':id'].questions[':questionId'].$patch({
        param: { id: assessmentId, questionId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Question updated',
      ERROR_MESSAGE: 'Failed to update question',
    },
  });

  return {
    updateQuestion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useDeleteQuestion = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiClient.assessments[':id'].questions[':questionId'].$delete({
        param: { id: assessmentId, questionId },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Question deleted',
      ERROR_MESSAGE: 'Failed to delete question',
    },
  });

  return {
    deleteQuestion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useReorderQuestions = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (order: { id: string; position: number }[]) => {
      const response = await apiClient.assessments[':id'].questions.reorder.$post({
        param: { id: assessmentId },
        json: { order },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      ERROR_MESSAGE: 'Failed to reorder questions',
    },
  });

  return {
    reorderQuestions: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useLinkQuestion = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { libraryQuestionId: string; position: number }) => {
      const response = await (apiClient.assessments[':id'].questions as any).link.$post({
        param: { id: assessmentId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Question added from library',
      ERROR_MESSAGE: 'Failed to add question',
    },
  });

  return {
    linkQuestion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// ============================================================
// Test Cases
// ============================================================

export const useCreateTestCase = (assessmentId: string, questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateTestCaseSchema) => {
      const response = await apiClient.assessments[':id'].questions[':questionId'][
        'test-cases'
      ].$post({
        param: { id: assessmentId, questionId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Test case added',
      ERROR_MESSAGE: 'Failed to add test case',
    },
  });

  return {
    createTestCase: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useUpdateTestCase = (assessmentId: string, questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      testCaseId,
      data,
    }: {
      testCaseId: string;
      data: UpdateTestCaseSchema;
    }) => {
      const response = await apiClient.assessments[':id'].questions[':questionId'][
        'test-cases'
      ][':testCaseId'].$patch({
        param: { id: assessmentId, questionId, testCaseId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Test case updated',
      ERROR_MESSAGE: 'Failed to update test case',
    },
  });

  return {
    updateTestCase: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useDeleteTestCase = (assessmentId: string, questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (testCaseId: string) => {
      const response = await apiClient.assessments[':id'].questions[':questionId'][
        'test-cases'
      ][':testCaseId'].$delete({
        param: { id: assessmentId, questionId, testCaseId },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Test case deleted',
      ERROR_MESSAGE: 'Failed to delete test case',
    },
  });

  return {
    deleteTestCase: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// ============================================================
// Submissions
// ============================================================

export const useSubmissions = (assessmentId: string) => {
  const query = useQuery({
    queryKey: ['assessments', assessmentId, 'submissions'],
    queryFn: async () => {
      const response = await apiClient.assessments[':id'].submissions.$get({
        param: { id: assessmentId },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      return response.json();
    },
    enabled: !!assessmentId,
    meta: {
      ERROR_MESSAGE: 'Failed to fetch submissions',
    },
  });

  return {
    submissions: query.data,
    ...query,
  };
};

export const useSubmission = (assessmentId: string, subId: string) => {
  const query = useQuery({
    queryKey: ['assessments', assessmentId, 'submissions', subId],
    queryFn: async () => {
      const response = await apiClient.assessments[':id'].submissions[':subId'].$get({
        param: { id: assessmentId, subId },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }
      return response.json();
    },
    enabled: !!assessmentId && !!subId,
    meta: {
      ERROR_MESSAGE: 'Failed to fetch submission details',
    },
  });

  return {
    submission: query.data,
    ...query,
  };
};

export const useInviteCandidate = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateSubmissionSchema) => {
      const response = await apiClient.assessments[':id'].submissions.$post({
        param: { id: assessmentId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', assessmentId, 'submissions'],
      });
    },
    meta: {
      SUCCESS_MESSAGE: 'Candidate invited',
      ERROR_MESSAGE: 'Failed to invite candidate',
    },
  });

  return {
    inviteCandidate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useGradeSubmission = (assessmentId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ subId, data }: { subId: string; data: GradeSubmissionSchema }) => {
      const response = await apiClient.assessments[':id'].submissions[':subId'].grade.$post({
        param: { id: assessmentId, subId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_, { subId }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', assessmentId, 'submissions', subId],
      });
      queryClient.invalidateQueries({
        queryKey: ['assessments', assessmentId, 'submissions'],
      });
    },
    meta: {
      SUCCESS_MESSAGE: 'Submission graded',
      ERROR_MESSAGE: 'Failed to grade submission',
    },
  });

  return {
    gradeSubmission: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

// ============================================================
// Candidates
// ============================================================

export const useCandidates = () => {
  const query = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await apiClient.candidates.$get();
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      return response.json();
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch candidates',
    },
  });

  return {
    candidates: query.data,
    ...query,
  };
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateCandidateSchema) => {
      const response = await apiClient.candidates.$post({
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Candidate created',
      ERROR_MESSAGE: 'Failed to create candidate',
    },
  });

  return {
    createCandidate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};
