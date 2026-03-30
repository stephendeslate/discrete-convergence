import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: AE-PERF-003
export interface PaginationParams {
  page: number;
  limit: number;
}

// TRACED: AE-PERF-004
// TRACED: AE-EDGE-004 — Page number below 1 is clamped to 1 by clampPagination
// TRACED: AE-EDGE-005 — Limit exceeding MAX_PAGE_SIZE (100) is clamped to maximum
export function clampPagination(page?: number, limit?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  return { page: clampedPage, limit: clampedLimit };
}

// TRACED: AE-PERF-005
export function paginationToSkipTake(params: PaginationParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}
