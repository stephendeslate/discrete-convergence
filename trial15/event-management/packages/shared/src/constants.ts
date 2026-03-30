// TRACED: EM-SHARED-001
// TRACED: EM-PERF-001
// TRACED: EM-PERF-002
// TRACED: EM-AUTH-001

/** Application version constant */
export const APP_VERSION = '1.0.0';

/** bcrypt salt rounds for password hashing — always 12 */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during self-registration — ADMIN excluded */
export const ALLOWED_REGISTRATION_ROLES = ['VIEWER'] as const;

/** Maximum items per page for pagination */
export const MAX_PAGE_SIZE = 100;

/** Default items per page when not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Sensitive keys to redact from logs */
export const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
] as const;
