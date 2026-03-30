// TRACED:PAGINATION-UTILS — Builds paginated responses
import { clampPagination, PaginatedResult } from '@repo/shared';

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page?: number,
  limit?: number,
): PaginatedResult<T> {
  const clamped = clampPagination(page, limit);
  return {
    data,
    meta: {
      page: clamped.page,
      limit: clamped.limit,
      total,
      totalPages: Math.ceil(total / clamped.limit),
    },
  };
}
