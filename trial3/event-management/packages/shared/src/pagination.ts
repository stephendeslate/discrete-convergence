import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Clamp pagination parameters to safe ranges.
 * Values above MAX_PAGE_SIZE are clamped (not rejected).
 */
export function clampPagination(
  page?: number,
  limit?: number,
): PaginationParams {
  const safePage = Math.max(1, Math.floor(page ?? 1));
  const safeLimit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(limit ?? DEFAULT_PAGE_SIZE)),
  );
  return { page: safePage, limit: safeLimit };
}
