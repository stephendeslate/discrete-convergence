// TRACED:PAG-UTILS — Pagination utility functions
import { clampPagination, PaginatedResult, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, MIN_PAGE } from '@repo/shared';
import type { PaginationParams } from '@repo/shared';

/**
 * Calculates skip/take for Prisma queries from page/limit.
 * TRACED:AE-PAG-004 — Pagination utility for Prisma
 */
/** Pagination defaults re-exported for convenience */
export const PAGINATION_DEFAULTS = { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, MIN_PAGE };

export function getPrismaSkipTake(page: number, limit: number): { skip: number; take: number } {
  const clamped = clampPagination(page, limit);
  return {
    skip: clamped.skip,
    take: clamped.limit,
  };
}

/** Type-safe pagination params helper */
export function toPaginationParams(page: number, limit: number): PaginationParams {
  const safePage = Math.max(MIN_PAGE, page);
  const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, limit));
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * Wraps data in a paginated response.
 */
export function paginateResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const clamped = clampPagination(page, limit);
  return {
    data,
    meta: {
      total,
      page: clamped.page,
      limit: clamped.limit,
      totalPages: Math.ceil(total / clamped.limit),
    },
  };
}
