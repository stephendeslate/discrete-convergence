import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Clamps pagination parameters to valid ranges.
 * Page defaults to 1, pageSize defaults to DEFAULT_PAGE_SIZE.
 * pageSize is clamped to [1, MAX_PAGE_SIZE].
 */
export function clampPagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE),
  );

  return {
    page: parsedPage,
    pageSize: parsedSize,
    skip: (parsedPage - 1) * parsedSize,
    take: parsedSize,
  };
}
