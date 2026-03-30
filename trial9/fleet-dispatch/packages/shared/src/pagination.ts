import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

// TRACED: FD-PERF-003
export function parsePagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE),
  );

  return {
    page: parsedPage,
    pageSize: parsedPageSize,
    skip: (parsedPage - 1) * parsedPageSize,
    take: parsedPageSize,
  };
}
