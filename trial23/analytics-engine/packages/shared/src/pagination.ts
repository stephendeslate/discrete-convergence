import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function clampPagination(
  page?: number,
  limit?: number,
): PaginationParams {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedLimit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(limit ?? DEFAULT_PAGE_SIZE)),
  );
  const offset = (clampedPage - 1) * clampedLimit;

  return {
    page: clampedPage,
    limit: clampedLimit,
    offset,
  };
}
