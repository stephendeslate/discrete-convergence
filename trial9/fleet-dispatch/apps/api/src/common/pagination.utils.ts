import { parsePagination } from '@fleet-dispatch/shared';
import type { PaginationParams } from '@fleet-dispatch/shared';

// TRACED: FD-PERF-004
export function getPagination(page?: string, pageSize?: string): PaginationParams {
  return parsePagination(page, pageSize);
}
