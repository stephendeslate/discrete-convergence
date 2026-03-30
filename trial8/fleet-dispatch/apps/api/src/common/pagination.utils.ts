import { clampPagination } from '@fleet-dispatch/shared';

export function getPagination(query: { page?: number; pageSize?: number }) {
  return clampPagination(query.page, query.pageSize);
}
