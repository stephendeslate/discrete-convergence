// TRACED:SHARED-PAGINATION

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const MIN_PAGE = 1;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function clampPagination(
  page?: number | string,
  limit?: number | string,
): PaginationParams {
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : (page ?? MIN_PAGE);
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit ?? DEFAULT_PAGE_SIZE);

  return {
    page: Math.max(MIN_PAGE, Number.isFinite(parsedPage) ? parsedPage : MIN_PAGE),
    limit: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_PAGE_SIZE),
    ),
  };
}
