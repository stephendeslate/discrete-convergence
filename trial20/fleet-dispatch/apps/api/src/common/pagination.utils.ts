import { clampPagination, paginationToSkipTake } from '@fleet-dispatch/shared';

// TRACED: FD-PERF-007
export function getSkipTake(page?: number, limit?: number) {
  const clamped = clampPagination(page, limit);
  return paginationToSkipTake(clamped);
}
