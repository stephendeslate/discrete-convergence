// TRACED: AE-CROSS-001
export const APP_VERSION = '1.0.0';

export const BCRYPT_SALT_ROUNDS = 12;

export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER'] as const;

export const MAX_PAGE_SIZE = 100;

export const DEFAULT_PAGE_SIZE = 20;

export const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
  'refreshtoken',
] as const;
