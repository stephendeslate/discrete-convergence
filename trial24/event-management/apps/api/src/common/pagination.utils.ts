// TRACED:PAGINATION-UTILS
import { clampPagination } from '@em/shared';
import type { PaginatedResult } from '@em/shared';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page?: number,
  pageSize?: number,
): PaginatedResult<T> {
  const clamped = clampPagination(page, pageSize);
  return {
    data,
    meta: {
      page: clamped.page,
      pageSize: clamped.pageSize,
      total,
    },
  };
}

export function getPrismaSkipTake(page?: number, pageSize?: number): { skip: number; take: number } {
  const clamped = clampPagination(page, pageSize);
  return {
    skip: (clamped.page - 1) * clamped.pageSize,
    take: clamped.pageSize,
  };
}
