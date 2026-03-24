// TRACED:FD-PAG-001
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export function clampPage(page: number | undefined): number {
  const p = Number(page) || 1;
  return Math.max(1, Math.floor(p));
}

export function clampLimit(limit: number | undefined): number {
  const l = Number(limit) || DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, Math.floor(l)), MAX_PAGE_SIZE);
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
