// TRACED:FD-AUTH-001 — bcrypt salt rounds for password hashing
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:FD-AUTH-002 — roles allowed during self-registration (ADMIN excluded)
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['DISPATCHER', 'DRIVER'];

// TRACED:FD-MON-001 — application version for health endpoint
export const APP_VERSION = '1.0.0';

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
