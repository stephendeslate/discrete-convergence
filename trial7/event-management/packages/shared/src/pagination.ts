import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Clamp pagination parameters to safe bounds.
 * page defaults to 1, pageSize defaults to DEFAULT_PAGE_SIZE, max is MAX_PAGE_SIZE.
 */
export function clampPagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE),
  );
  return {
    page: p,
    pageSize: ps,
    skip: (p - 1) * ps,
    take: ps,
  };
}
