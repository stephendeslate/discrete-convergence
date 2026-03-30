// TRACED:AE-INF-005 — shared package exports >= 8 consumed utilities
export {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  ALLOWED_REGISTRATION_ROLES,
  MAX_WIDGETS_PER_DASHBOARD,
} from './constants';

export { createCorrelationId } from './correlation';
export { sanitizeLogContext } from './log-sanitizer';
export { formatLogEntry } from './log-format';
export type { LogEntry } from './log-format';
export { validateEnvVars } from './env-validation';
export { clampPagination } from './pagination';
export type { PaginationParams, PaginatedResult } from './pagination';
