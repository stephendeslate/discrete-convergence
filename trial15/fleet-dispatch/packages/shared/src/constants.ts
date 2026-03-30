// TRACED: FD-AUTH-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: FD-AUTH-003
export const ALLOWED_REGISTRATION_ROLES = ['viewer', 'dispatcher'] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: FD-MON-003
export const APP_VERSION = '1.0.0';

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
