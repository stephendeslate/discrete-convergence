import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: AE-PERF-003
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

// TRACED: AE-PERF-004
export function parsePagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE),
  );

  return {
    page: parsedPage,
    pageSize: parsedSize,
    skip: (parsedPage - 1) * parsedSize,
    take: parsedSize,
  };
}
