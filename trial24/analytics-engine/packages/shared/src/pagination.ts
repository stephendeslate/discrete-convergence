import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, MIN_PAGE } from './index';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function clampPagination(page?: number, limit?: number): PaginationParams {
  const clampedPage = Math.max(MIN_PAGE, Math.floor(page ?? MIN_PAGE));
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit ?? DEFAULT_PAGE_SIZE)));
  return { page: clampedPage, limit: clampedLimit };
}
