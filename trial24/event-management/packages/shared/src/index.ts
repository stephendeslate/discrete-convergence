// TRACED:SHARED-INDEX

export const APP_VERSION = '0.1.0';
export const BCRYPT_SALT_ROUNDS = 12;

export {
  CORRELATION_ID_HEADER,
  createCorrelationId,
} from './correlation';

export {
  sanitizeLogContext,
} from './log-sanitizer';

export {
  validateEnvVars,
} from './env-validation';

export {
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  clampPagination,
} from './pagination';

export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export type { PaginationParams, PaginatedResult } from './pagination';
