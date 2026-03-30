// TRACED:FD-COMMON-008 — Pagination utilities
// TRACED:FD-PAGE-001 — buildSkipTake computes correct offset for page 1
// TRACED:FD-PAGE-002 — buildSkipTake computes correct offset for later pages
import { PaginationParams, buildPaginatedResponse, PaginatedResponse, clampPage, clampPageSize } from '@repo/shared';

export function buildSkipTake(params: PaginationParams): { skip: number; take: number } {
  const page = clampPage(params.page);
  const pageSize = clampPageSize(params.pageSize);
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export { buildPaginatedResponse, PaginatedResponse };
