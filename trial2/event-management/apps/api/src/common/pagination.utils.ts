import { clampPagination } from '@event-management/shared';

// TRACED:EM-PERF-002 — Pagination clamping uses shared clampPagination

export function getPagination(params: { page?: number; pageSize?: number }) {
  return clampPagination(params);
}
