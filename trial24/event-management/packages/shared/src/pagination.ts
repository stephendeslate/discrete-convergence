// TRACED:SHARED-PAGINATION

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const MIN_PAGE = 1;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export function clampPagination(page?: number, pageSize?: number): PaginationParams {
  const clampedPage = Math.max(MIN_PAGE, Math.floor(Number(page) || MIN_PAGE));
  const clampedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE)),
  );
  return { page: clampedPage, pageSize: clampedPageSize };
}
