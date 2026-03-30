/** Application version used in health endpoints and monitoring */
export const APP_VERSION = '1.0.0';

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during self-registration (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER'] as const;

/** Maximum items per page for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default items per page when no page size is specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum number of widgets per dashboard */
export const MAX_WIDGETS_PER_DASHBOARD = 20;

/** DataSource limits by tenant tier */
export const DATA_SOURCE_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 20,
  ENTERPRISE: Infinity,
};

/** Sync schedule options by tier */
export const SYNC_SCHEDULE_BY_TIER: Record<string, readonly string[]> = {
  FREE: ['MANUAL'],
  PRO: ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY'],
  ENTERPRISE: ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'REALTIME'],
};

/** Max consecutive sync failures before auto-pause */
export const MAX_SYNC_FAILURES = 5;
