// TRACED:AE-PAG-001 — Pagination types and utilities

import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, MIN_PAGE } from './index';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function clampPagination(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(MIN_PAGE, page ?? MIN_PAGE);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? DEFAULT_PAGE_SIZE));
  const skip = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, skip };
}
