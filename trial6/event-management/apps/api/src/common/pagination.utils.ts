// TRACED:EM-PERF-003 — Pagination response builder with computed metadata
import { clampPagination } from '@event-management/shared';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: { page?: number; pageSize?: number },
): PaginatedResult<T> {
  const { page, pageSize } = clampPagination(params);
  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
