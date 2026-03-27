// TRACED: FD-API-001 — Pagination utilities
import { clampPage, clampPageSize, DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function paginate(page?: number, pageSize?: number) {
  const p = clampPage(page);
  const s = clampPageSize(pageSize);
  return {
    skip: (p - 1) * s,
    take: s,
    page: p,
    pageSize: s,
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
