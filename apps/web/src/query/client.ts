import { AppRouter } from '@coderscreen/api';
import {
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { inferAdditionalFields, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { hc } from 'hono/client';
import { toast } from 'sonner';
import { handleApiError } from '@/query/error.query';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const apiClient = hc<AppRouter>(API_URL, {
  init: {
    credentials: 'include',
  },
});

export const TanstackQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (_data: unknown, query: Query<unknown, unknown, unknown, QueryKey>): void => {
      if (query.meta?.SUCCESS_MESSAGE) {
        toast.success(`${query.meta.SUCCESS_MESSAGE}`);
      }
    },
    onError: (error: unknown, query: Query<unknown, unknown, unknown, QueryKey>): void => {
      handleApiError(error, query.meta?.ERROR_MESSAGE as string);
      throw error;
    },
  }),
  mutationCache: new MutationCache({
    onError: (
      error: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      handleApiError(error, mutation.meta?.ERROR_MESSAGE as string);
      throw error;
    },
    onSuccess: (
      _data: unknown,
      _variables: unknown,
      _context: unknown,
      mutation: Mutation<unknown, unknown, unknown, unknown>
    ): void => {
      if (mutation.meta?.SUCCESS_MESSAGE) {
        toast.success(`${mutation.meta.SUCCESS_MESSAGE}`);
      }
    },
  }),
});

export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  plugins: [
    organizationClient(),
    inferAdditionalFields({
      user: {
        isOnboarded: {
          type: 'boolean',
          required: true,
          input: false,
        },
        persona: {
          type: 'string',
          required: false,
          input: true,
        },
      },
    }),
  ],
});
