import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(
  page?: number | string,
  pageSize?: number | string,
): PaginationParams {
  const parsedPage = Math.max(1, Number(page) || 1);
  const requestedSize = Number(pageSize) || DEFAULT_PAGE_SIZE;
  const clampedSize = Math.min(Math.max(1, requestedSize), MAX_PAGE_SIZE);

  return {
    page: parsedPage,
    pageSize: clampedSize,
    skip: (parsedPage - 1) * clampedSize,
    take: clampedSize,
  };
}
