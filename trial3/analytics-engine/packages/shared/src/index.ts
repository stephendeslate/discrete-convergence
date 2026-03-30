// TRACED:AE-SHARED-001 — shared package exports
export {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  ALLOWED_REGISTRATION_ROLES,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_WIDGETS_PER_DASHBOARD,
  DATA_SOURCE_LIMITS,
  SYNC_SCHEDULE_BY_TIER,
  MAX_SYNC_FAILURES,
} from './constants';

export { createCorrelationId } from './correlation';
export { sanitizeLogContext } from './log-sanitizer';
export { formatLogEntry } from './log-format';
export type { LogEntry } from './log-format';
export { validateEnvVars } from './env-validation';
export { clampPagination } from './pagination';
export type { PaginationParams } from './pagination';
