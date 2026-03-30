import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
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

// TRACED:FD-PERF-001
export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
  );
  return { page: clampedPage, pageSize: clampedPageSize };
}
