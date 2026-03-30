import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// TRACED: EM-PERF-003
export function clampPagination(page?: number, limit?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  return { page: clampedPage, limit: clampedLimit };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
