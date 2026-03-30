// TRACED:AE-PRF-002 — pagination clamping uses clampPagination from shared
import { clampPagination } from '@analytics-engine/shared';
import type { PaginatedResult } from '@analytics-engine/shared';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page?: number,
  pageSize?: number,
): PaginatedResult<T> {
  const params = clampPagination(page, pageSize);
  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  };
}

export { clampPagination };
