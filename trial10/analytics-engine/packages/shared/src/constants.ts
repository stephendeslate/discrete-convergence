/** Number of salt rounds for bcryptjs password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles that are allowed during user registration — ADMIN excluded */
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['USER', 'VIEWER'] as const;

/** Maximum number of items per page for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default number of items per page when not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Application version for health endpoint and monitoring */
export const APP_VERSION = '1.0.0';
