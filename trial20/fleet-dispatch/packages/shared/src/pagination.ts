import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: FD-PERF-003
export interface PaginationParams {
  page: number;
  limit: number;
}

// TRACED: FD-PERF-004
export function clampPagination(page?: number, limit?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  return { page: clampedPage, limit: clampedLimit };
}

// TRACED: FD-PERF-005
export function paginationToSkipTake(params: PaginationParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}
