// TRACED: AE-EDGE-016 — Page size clamped to maximum
// TRACED: AE-EDGE-017 — Empty result set returns empty array

import { clampPage, clampPageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@analytics-engine/shared';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(
  page?: number,
  pageSize?: number,
): PaginationParams {
  const clampedPage = clampPage(page ?? 1);
  const bounded = pageSize ?? DEFAULT_PAGE_SIZE;
  const clampedPageSize = clampPageSize(Math.min(bounded, MAX_PAGE_SIZE));
  return {
    page: clampedPage,
    pageSize: clampedPageSize,
    skip: (clampedPage - 1) * clampedPageSize,
    take: clampedPageSize,
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  };
}
