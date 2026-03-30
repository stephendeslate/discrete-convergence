import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// TRACED: FD-API-004
// TRACED: FD-EDGE-004
export function parsePagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}
