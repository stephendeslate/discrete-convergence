import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: FD-PERF-003
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

// TRACED: FD-PERF-004
export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    page: clampedPage,
    pageSize: clampedSize,
    skip: (clampedPage - 1) * clampedSize,
    take: clampedSize,
  };
}
