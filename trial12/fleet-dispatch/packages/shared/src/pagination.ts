import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: FD-PERF-003
export function clampPageSize(requested?: number): number {
  if (!requested || requested < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(requested, MAX_PAGE_SIZE);
}

// TRACED: FD-PERF-004
export function clampPage(requested?: number): number {
  if (!requested || requested < 1) {
    return 1;
  }
  return requested;
}
