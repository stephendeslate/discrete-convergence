import { clampPagination, DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page?: number,
  pageSize?: number,
): PaginatedResult<T> {
  const clamped = clampPagination(page ?? 1, pageSize ?? DEFAULT_PAGE_SIZE);
  return {
    data,
    meta: {
      page: clamped.page,
      pageSize: clamped.pageSize,
      total,
      totalPages: Math.ceil(total / clamped.pageSize),
    },
  };
}
