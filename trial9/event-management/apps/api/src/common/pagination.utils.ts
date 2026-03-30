// TRACED: EM-PERF-004
import { parsePagination } from '@event-management/shared';
import type { PaginationParams } from '@event-management/shared';

export function getPagination(page?: string, pageSize?: string): PaginationParams {
  return parsePagination(page, pageSize);
}
