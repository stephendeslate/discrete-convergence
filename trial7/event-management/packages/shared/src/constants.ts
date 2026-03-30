/** Application version — used in health endpoint and CLAUDE.md */
export const APP_VERSION = '1.0.0';

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during self-registration (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'ORGANIZER'] as const;

/** Maximum page size for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default page size for paginated queries */
export const DEFAULT_PAGE_SIZE = 20;
