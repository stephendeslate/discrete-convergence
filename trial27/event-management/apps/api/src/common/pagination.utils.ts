// TRACED: EM-EDGE-010 — Pagination utilities
import { clampPage, clampPageSize } from '@event-management/shared';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function getPaginationParams(page?: string, pageSize?: string): PaginationParams {
  const p = clampPage(page);
  const ps = clampPageSize(pageSize);
  return {
    skip: (p - 1) * ps,
    take: ps,
    page: p,
    pageSize: ps,
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
