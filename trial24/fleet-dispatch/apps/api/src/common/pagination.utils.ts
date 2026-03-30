// TRACED:API-PAGINATION-UTILS
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';

export function buildPaginatedResponse<T>(
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

export function buildSkipTake(page: number, limit: number): { skip: number; take: number } {
  const clamped = clampPagination(page, limit);
  return {
    skip: (clamped.page - 1) * clamped.limit,
    take: clamped.limit,
  };
}
