// TRACED: AE-API-004 — pagination with MAX_PAGE_SIZE clamp
// TRACED: AE-EDGE-005 — null pagination → DEFAULT_PAGE_SIZE
// TRACED: AE-EDGE-006 — overflow page size → MAX_PAGE_SIZE
import { clampPagination } from '@repo/shared';

export function parsePaginationParams(
  page?: number,
  limit?: number,
): { page: number; limit: number } {
  return clampPagination(page, limit);
}
