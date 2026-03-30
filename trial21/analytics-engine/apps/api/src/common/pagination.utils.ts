import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@analytics-engine/shared';

export interface PaginationParams {
  skip: number;
  take: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Computes pagination parameters from page/limit inputs.
 * VERIFY: AE-DATA-003 — pagination utility clamps to MAX_PAGE_SIZE
 */
export function getPaginationParams(page?: number, limit?: number): PaginationParams {
  const safePage = Math.max(1, page ?? 1); // TRACED: AE-DATA-005
  const safeLimit = Math.min(Math.max(1, limit ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE); // TRACED: AE-DATA-003 // TRACED: AE-DATA-006
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit), // TRACED: AE-DATA-007
  };
}
