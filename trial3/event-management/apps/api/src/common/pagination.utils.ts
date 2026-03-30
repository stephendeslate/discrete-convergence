// TRACED:EM-PERF-001
import { clampPagination } from '@event-management/shared';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(query: { page?: number; limit?: number }): {
  skip: number;
  take: number;
  page: number;
  limit: number;
} {
  const { page, limit } = clampPagination(query.page, query.limit);
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
