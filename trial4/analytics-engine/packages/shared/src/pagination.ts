import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Clamp pagination parameters to valid ranges.
 * Page is at least 1, pageSize is clamped between 1 and MAX_PAGE_SIZE.
 */
export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  return { page: clampedPage, pageSize: clampedSize };
}
