import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: AE-PERF-003
export function clampPageSize(requested?: number): number {
  if (!requested || requested < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(requested, MAX_PAGE_SIZE);
}

export function clampPage(requested?: number): number {
  if (!requested || requested < 1) {
    return 1;
  }
  return requested;
}

export function calculateSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
