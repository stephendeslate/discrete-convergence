// TRACED: FD-PERF-007
import { clampPageSize, clampPage } from '@fleet-dispatch/shared';

export function getPaginationParams(page?: number, limit?: number) {
  const clampedPage = clampPage(page);
  const clampedLimit = clampPageSize(limit);
  const skip = (clampedPage - 1) * clampedLimit;
  return { skip, take: clampedLimit };
}
