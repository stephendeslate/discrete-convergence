// TRACED: AE-AUTH-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: AE-AUTH-002
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER'] as const;

// TRACED: AE-PERF-001
export const MAX_PAGE_SIZE = 100;

// TRACED: AE-PERF-002
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: AE-MON-001
export const APP_VERSION = '1.0.0';

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
