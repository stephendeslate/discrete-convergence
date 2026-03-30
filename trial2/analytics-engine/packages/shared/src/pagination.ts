const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Clamps pagination parameters to safe bounds.
 * page is clamped to >= 1, pageSize is clamped to [1, MAX_PAGE_SIZE].
 * Uses default page size when no pageSize is provided.
 */
export function clampPagination(
  page?: number,
  pageSize?: number,
): PaginationParams {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)),
  );

  return { page: clampedPage, pageSize: clampedPageSize };
}
