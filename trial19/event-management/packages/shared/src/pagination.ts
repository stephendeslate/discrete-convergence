import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: EM-PERF-003
// TRACED: EM-PERF-004
export function clampPagination(page?: number, pageSize?: number): { page: number; pageSize: number; skip: number; take: number } {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedPageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    page: clampedPage,
    pageSize: clampedPageSize,
    skip: (clampedPage - 1) * clampedPageSize,
    take: clampedPageSize,
  };
}
