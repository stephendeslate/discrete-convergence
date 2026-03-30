import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED: AE-PERF-001
// TRACED: AE-EDGE-007 — Clamps page size to MAX_PAGE_SIZE, negative pages treated as 1
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: { page?: number; limit?: number }): PaginationParams {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, query.limit ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
