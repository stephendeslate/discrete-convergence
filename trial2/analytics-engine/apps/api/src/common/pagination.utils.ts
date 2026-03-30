import { clampPagination } from '@analytics-engine/shared';

// TRACED:AE-PERF-002 — Pagination clamping (not rejecting) with shared utility
export function getPaginationParams(page?: number, pageSize?: number) {
  const clamped = clampPagination(page, pageSize);
  return {
    skip: (clamped.page - 1) * clamped.pageSize,
    take: clamped.pageSize,
    page: clamped.page,
    pageSize: clamped.pageSize,
  };
}
