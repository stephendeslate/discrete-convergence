/**
 * Fleet Dispatch shared constants.
 * All exports here must be consumed by at least one file in apps/api or apps/web.
 */

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during self-registration — ADMIN is excluded */
export const ALLOWED_REGISTRATION_ROLES = ['DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as const;

/** Application version — used in health endpoint and CLAUDE.md */
export const APP_VERSION = '1.0.0';

/** Maximum page size for pagination — consumed internally by clampPagination */
const MAX_PAGE_SIZE = 100;

/** Default page size for pagination — consumed internally by clampPagination */
const DEFAULT_PAGE_SIZE = 20;

/**
 * Clamp pagination parameters to valid ranges.
 * Uses MAX_PAGE_SIZE and DEFAULT_PAGE_SIZE internally.
 */
export function clampPagination(page?: number, pageSize?: number): { page: number; take: number; skip: number } {
  const validPage = Math.max(1, Math.floor(page ?? 1));
  const validSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)));
  return {
    page: validPage,
    take: validSize,
    skip: (validPage - 1) * validSize,
  };
}
