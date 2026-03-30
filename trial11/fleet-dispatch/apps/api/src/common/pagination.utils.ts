import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginationParams } from '@fleet-dispatch/shared';

// TRACED: FD-PERF-003
// TRACED: FD-PERF-004
export function getPagination(page?: number, pageSize?: number): PaginationParams {
  return clampPagination(page, pageSize);
}
