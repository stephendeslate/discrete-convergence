// TRACED: FD-AUTH-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: FD-AUTH-002
export const ALLOWED_REGISTRATION_ROLES = ['DISPATCHER', 'DRIVER'] as const;

// TRACED: FD-PERF-001
export const MAX_PAGE_SIZE = 100;

// TRACED: FD-PERF-002
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: FD-MON-001
export const APP_VERSION = '1.0.0';

export const JWT_EXPIRY = '1h';

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
