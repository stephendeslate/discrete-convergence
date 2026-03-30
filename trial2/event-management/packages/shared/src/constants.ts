/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during registration — ADMIN excluded */
export const ALLOWED_REGISTRATION_ROLES = ['ORGANIZER', 'ATTENDEE'] as const;

/** Application version identifier */
export const APP_VERSION = '1.0.0';

/** Maximum allowed page size for pagination */
const MAX_PAGE_SIZE = 100;

/** Default page size for pagination */
const DEFAULT_PAGE_SIZE = 20;

/**
 * Clamps pagination parameters to valid ranges.
 * Ensures page >= 1 and pageSize between 1 and MAX_PAGE_SIZE.
 */
export function clampPagination(params: { page?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
