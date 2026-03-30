// TRACED:AE-SHARED-001 — Shared package barrel exports

export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const MIN_PAGE = 1;
export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export { createCorrelationId } from './correlation';
export { sanitizeLogContext } from './log-sanitizer';
export { validateEnvVars } from './env-validation';
export { clampPagination } from './pagination';
export type { PaginationParams, PaginatedResult } from './pagination';
