// TRACED:EM-CONST-001 — Shared constants used across API and web apps
export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['ORGANIZER', 'ATTENDEE'];
export const MAX_CUSTOM_FIELDS_PER_EVENT = 10;
export const MAX_EVENTS_BY_TIER: Record<string, number> = {
  FREE: 5,
  PRO: 50,
  ENTERPRISE: Infinity,
};
export const NOTIFICATION_RATE_LIMIT_MINUTES = 60;
