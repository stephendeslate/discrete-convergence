import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED:FD-PERF-001 — pagination clamping (never rejects, always clamps)
export interface PaginationParams {
  page: number;
  pageSize: number;
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

export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)),
  );
  return { page: clampedPage, pageSize: clampedPageSize };
}
