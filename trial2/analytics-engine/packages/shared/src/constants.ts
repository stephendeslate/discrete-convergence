/** Salt rounds for bcrypt password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles permitted for self-registration (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['USER', 'VIEWER'] as const;

/** Application version string used in health endpoints and CLAUDE.md */
export const APP_VERSION = '0.1.0';
