import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: EM-PERF-001
export function clampPageSize(requestedSize?: number): number {
  if (!requestedSize || requestedSize < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(requestedSize, MAX_PAGE_SIZE);
}

// TRACED: EM-PERF-002
export function calculateSkip(page?: number, pageSize?: number): number {
  const safePage = Math.max(1, page ?? 1);
  const safeSize = clampPageSize(pageSize);
  return (safePage - 1) * safeSize;
}
