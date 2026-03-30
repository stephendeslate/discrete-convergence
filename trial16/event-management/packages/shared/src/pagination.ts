// TRACED: EM-PERF-003
// TRACED: EM-PERF-004
import { MAX_PAGE_SIZE } from './constants';

/** Clamp pagination parameters to safe bounds */
export function clampPagination(page: number, pageSize: number): { page: number; pageSize: number } {
  const clampedPage = Math.max(1, Math.floor(page));
  const clampedPageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)));
  return { page: clampedPage, pageSize: clampedPageSize };
}
