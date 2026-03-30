import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: EM-PERF-003
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// TRACED: EM-PERF-004
export function clampPagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}
