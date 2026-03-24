// TRACED:AE-CONST-001 — Shared constants used across API and web apps
export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER'] as const;
export const JWT_EXPIRY = '1h';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const MAX_WIDGETS_PER_DASHBOARD = 20;
export const CACHE_TTL_BY_TIER = {
  FREE: 300,
  PRO: 60,
  ENTERPRISE: 30,
} as const;
