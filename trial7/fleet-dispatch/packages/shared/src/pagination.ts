import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED:FD-PERF-003
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

// TRACED:FD-PERF-004
export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const safePage = Math.max(1, page ?? 1);
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}
