import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const effectiveLimit = limit > 0 ? limit : DEFAULT_PAGE_SIZE;
  return {
    data,
    total,
    page,
    limit: effectiveLimit,
    totalPages: Math.ceil(total / effectiveLimit),
  };
}
