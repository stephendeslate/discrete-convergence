import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED:AE-PAG-001 — Pagination clamping (not rejecting) per methodology
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
  );
  return { page: clampedPage, pageSize: clampedPageSize };
}

export function getPaginationSkip(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}
