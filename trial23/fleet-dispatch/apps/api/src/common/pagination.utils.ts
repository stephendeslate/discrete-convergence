// TRACED: FD-API-004 — Paginated list endpoints return { data, meta } envelope
// TRACED: FD-EDGE-005 — Page < 1 clamped to 1
// TRACED: FD-EDGE-006 — Limit > MAX_PAGE_SIZE clamped to MAX_PAGE_SIZE
import { clampPagination } from '@repo/shared';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  page?: number,
  limit?: number,
): PaginatedResult<T> {
  const clamped = clampPagination(page, limit);
  return {
    data,
    meta: {
      page: clamped.page,
      limit: clamped.limit,
      total,
      totalPages: Math.ceil(total / clamped.limit),
    },
  };
}

export { clampPagination };
