import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-PERF-001
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Clamps pagination parameters to valid ranges.
 * Page size is clamped to MAX_PAGE_SIZE, not rejected.
 */
export function parsePagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const requestedSize = Number(pageSize) || DEFAULT_PAGE_SIZE;
  const clampedSize = Math.min(Math.max(1, requestedSize), MAX_PAGE_SIZE);

  return {
    page: parsedPage,
    pageSize: clampedSize,
    skip: (parsedPage - 1) * clampedSize,
    take: clampedSize,
  };
}
