import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

export function clampPagination(page?: number, limit?: number): { skip: number; take: number; page: number; limit: number } {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedLimit = Math.min(Math.max(1, limit ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  return {
    skip: (clampedPage - 1) * clampedLimit,
    take: clampedLimit,
    page: clampedPage,
    limit: clampedLimit,
  };
}
