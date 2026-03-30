// TRACED:EM-AUTH-004 TRACED:EM-SEC-002
// --- Constants ---
export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

// --- Re-exports from sub-modules ---
export { CORRELATION_ID_HEADER, createCorrelationId } from './correlation';
export { sanitizeLogContext } from './log-sanitizer';
export { validateEnvVars } from './env-validation';
export {
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  clampPagination,
} from './pagination';
export type { PaginationParams, PaginatedResult } from './pagination';
