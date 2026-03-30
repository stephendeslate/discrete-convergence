import { clampPagination, DEFAULT_PAGE_SIZE } from '@event-management/shared';

export function getPaginationParams(page?: number, pageSize?: number) {
  const clamped = clampPagination(page ?? 1, pageSize ?? DEFAULT_PAGE_SIZE);
  return {
    skip: (clamped.page - 1) * clamped.pageSize,
    take: clamped.pageSize,
    page: clamped.page,
    pageSize: clamped.pageSize,
  };
}
