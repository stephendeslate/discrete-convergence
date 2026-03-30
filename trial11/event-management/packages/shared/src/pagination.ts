import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: EM-PERF-003
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

// TRACED: EM-PERF-004
export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedPageSize = Math.min(
    Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  return {
    page: clampedPage,
    pageSize: clampedPageSize,
    skip: (clampedPage - 1) * clampedPageSize,
    take: clampedPageSize,
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  };
}
