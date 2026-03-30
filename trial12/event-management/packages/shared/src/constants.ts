// TRACED: EM-SHARED-001
export const APP_VERSION = '1.0.0';

// TRACED: EM-SHARED-002
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-SHARED-003
export const MAX_PAGE_SIZE = 100;

// TRACED: EM-SHARED-004
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: EM-AUTH-003
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'ORGANIZER'] as const;

export const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'access_token',
  'secret',
  'authorization',
] as const;
