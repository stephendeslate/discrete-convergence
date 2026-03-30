/** Application version — used in health endpoints and CLAUDE.md */
export const APP_VERSION = '1.0.0';

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Maximum items per page for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default items per page when not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Roles that may self-register (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['ORGANIZER', 'ATTENDEE'] as const;
