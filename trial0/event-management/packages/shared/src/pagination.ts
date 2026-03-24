// TRACED:EM-PAG-001 — Pagination clamping (not rejecting) per methodology
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export function clampPagination(page?: number, limit?: number): { page: number; limit: number } {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit ?? DEFAULT_PAGE_SIZE)));
  return { page: clampedPage, limit: clampedLimit };
}

export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
