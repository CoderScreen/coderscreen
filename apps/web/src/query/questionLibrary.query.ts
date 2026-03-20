import type {
  CreateQuestionLibrarySchema,
  CreateQuestionLibraryTestCaseSchema,
  QuestionLibrarySchema,
  QuestionLibraryTestCaseSchema,
  UpdateQuestionLibrarySchema,
  UpdateQuestionLibraryTestCaseSchema,
} from '@coderscreen/api/schema/questionLibrary';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { throwApiError } from '@/query/error.query';
import { apiClient } from './client';

export type QuestionLibraryItem = QuestionLibrarySchema;
export type QuestionLibraryWithTestCases = QuestionLibrarySchema & {
  testCases: QuestionLibraryTestCaseSchema[];
};

// ============================================================
// Questions
// ============================================================

export const useQuestionLibrary = () => {
  const query = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const response = await apiClient.questions.$get();
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return (await response.json()) as QuestionLibraryItem[];
    },
    meta: {
      ERROR_MESSAGE: 'Failed to fetch questions',
    },
  });

  return {
    questions: query.data,
    ...query,
  };
};

export const useQuestionLibraryItem = (id: string) => {
  const query = useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const response = await apiClient.questions[':id'].$get({
        param: { id },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      return (await response.json()) as QuestionLibraryWithTestCases;
    },
    enabled: !!id,
    meta: {
      ERROR_MESSAGE: 'Failed to fetch question',
    },
  });

  return {
    question: query.data,
    ...query,
  };
};

export const useCreateQuestionLibrary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateQuestionLibrarySchema) => {
      const response = await apiClient.questions.$post({
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    meta: {
      SUCCESS_MESSAGE: 'Question created',
      ERROR_MESSAGE: 'Failed to create question',
    },
  });

  return {
    createQuestion: mutation.mutateAsync,
    isLoading: mutation.isPending,
    ...mutation,
  };
};

export const useUpdateQuestionLibrary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuestionLibrarySchema }) => {
      const response = await apiClient.questions[':id'].$patch({
        param: { id },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['questions', id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
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

export const useDeleteQuestionLibrary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.questions[':id'].$delete({
        param: { id },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['questions', id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
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

// ============================================================
// Test Cases
// ============================================================

export const useCreateQuestionLibraryTestCase = (questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateQuestionLibraryTestCaseSchema) => {
      const response = await apiClient.questions[':id']['test-cases'].$post({
        param: { id: questionId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', questionId] });
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

export const useUpdateQuestionLibraryTestCase = (questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      testCaseId,
      data,
    }: {
      testCaseId: string;
      data: UpdateQuestionLibraryTestCaseSchema;
    }) => {
      const response = await apiClient.questions[':id']['test-cases'][':testCaseId'].$patch({
        param: { id: questionId, testCaseId },
        json: data,
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', questionId] });
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

export const useDeleteQuestionLibraryTestCase = (questionId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (testCaseId: string) => {
      const response = await apiClient.questions[':id']['test-cases'][':testCaseId'].$delete({
        param: { id: questionId, testCaseId },
      });
      if (!response.ok) {
        await throwApiError(response);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', questionId] });
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
