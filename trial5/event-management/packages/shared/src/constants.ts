// TRACED:EM-AUTH-001 — BCRYPT_SALT_ROUNDS shared constant for consistent hashing
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:EM-AUTH-002 — ALLOWED_REGISTRATION_ROLES excludes ADMIN
export const ALLOWED_REGISTRATION_ROLES = ['ORGANIZER', 'VIEWER'] as const;

// TRACED:EM-CROSS-003 — APP_VERSION used in health endpoint and CLAUDE.md
export const APP_VERSION = '1.0.0';

// MAX_PAGE_SIZE and DEFAULT_PAGE_SIZE are internal to clampPagination
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

// TRACED:EM-PERF-001 — Pagination clamping (not rejection)
export function clampPagination(params: { page?: number; pageSize?: number }): { page: number; pageSize: number; skip: number; take: number } {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(params.pageSize ?? DEFAULT_PAGE_SIZE)));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
