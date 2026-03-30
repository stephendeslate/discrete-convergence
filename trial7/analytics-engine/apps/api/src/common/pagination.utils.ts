import { clampPagination } from '@analytics-engine/shared';
import type { PaginationParams } from '@analytics-engine/shared';

// TRACED:AE-PERF-002
export function getPagination(page?: number | string, pageSize?: number | string): PaginationParams {
  return clampPagination(page, pageSize);
}
