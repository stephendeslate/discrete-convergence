import { clampPageSize, clampPage, calculateSkip } from '@analytics-engine/shared';

// TRACED: AE-PERF-005
export function getPaginationParams(page?: number, limit?: number) {
  const pageSize = clampPageSize(limit);
  const currentPage = clampPage(page);
  const skip = calculateSkip(currentPage, pageSize);

  return { skip, take: pageSize, page: currentPage, pageSize };
}
