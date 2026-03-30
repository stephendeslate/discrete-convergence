// TRACED:FD-CONST-001
export const APP_VERSION = '1.0.0';

// TRACED:FD-CONST-002
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:FD-SEC-003
export const ALLOWED_REGISTRATION_ROLES = ['DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as const;

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
