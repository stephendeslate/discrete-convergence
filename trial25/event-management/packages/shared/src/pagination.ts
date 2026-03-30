// TRACED:EM-DATA-004
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
    totalPages: number;
  };
}

/** Clamp pagination params to safe bounds */
export function clampPagination(params: Partial<PaginationParams>): PaginationParams {
  const page = Math.max(MIN_PAGE, Math.floor(params.page ?? MIN_PAGE));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(params.pageSize ?? DEFAULT_PAGE_SIZE)));
  return { page, pageSize };
}
