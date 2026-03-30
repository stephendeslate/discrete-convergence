/** Application version — used in health endpoints and CLAUDE.md */
export const APP_VERSION = '1.0.0';

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed for self-registration (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER'] as const;

/** Maximum page size for pagination */
export const MAX_PAGE_SIZE = 100;

/** Default page size for pagination */
export const DEFAULT_PAGE_SIZE = 20;

/** Roles enum for RBAC */
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}
