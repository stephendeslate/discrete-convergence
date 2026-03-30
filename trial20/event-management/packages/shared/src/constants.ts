// TRACED: EM-AUTH-003
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-AUTH-004
export const ALLOWED_REGISTRATION_ROLES = ['VIEWER'] as const;

// TRACED: EM-PERF-001
export const MAX_PAGE_SIZE = 100;

// TRACED: EM-PERF-002
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: EM-INFRA-001
export const APP_VERSION = '1.0.0';

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
