const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export function clampPagination(
  page?: number,
  pageSize?: number,
): { pageSize: number; skip: number } {
  const clampedPage = Math.max(1, page ?? 1);
  const clampedSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    pageSize: clampedSize,
    skip: (clampedPage - 1) * clampedSize,
  };
}
