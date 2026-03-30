// TRACED:FD-SHARED-001 — Shared constants and utilities barrel export

export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';


export { CORRELATION_ID_HEADER, isValidCorrelationId } from './correlation';
export { sanitizeLogData, sanitizeString } from './log-sanitizer';
export { validateEnvVars } from './env-validation';
export type { EnvConfig } from './env-validation';
export {
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  buildPaginatedResponse,
  clampPage,
  clampPageSize,
} from './pagination';
export type { PaginationParams, PaginatedResponse } from './pagination';
