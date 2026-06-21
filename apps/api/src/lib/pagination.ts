import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export function paginateQuery(query: PaginationQuery) {
  return {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  query: PaginationQuery
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalCount,
      totalPages: Math.ceil(totalCount / query.limit),
    },
  };
}
