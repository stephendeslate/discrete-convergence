import { clampPagination, buildPaginatedResult } from '@event-management/shared';
import type { PaginationParams, PaginatedResult } from '@event-management/shared';

// TRACED: EM-PERF-005
// TRACED: EM-EDGE-009 — Page limit exceeding MAX_PAGE_SIZE is clamped to 100
export function getPaginationParams(page?: number, limit?: number): PaginationParams {
  return clampPagination(page, limit);
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return buildPaginatedResult(data, total, params);
}
