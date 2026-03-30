/**
 * @fleet-dispatch/shared — barrel export
 *
 * Every export here must be consumed by at least one file in apps/api or apps/web.
 * MAX_PAGE_SIZE and DEFAULT_PAGE_SIZE are consumed internally by clampPagination
 * and are NOT re-exported to avoid dead exports.
 */

export { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, clampPagination } from './constants';
export { createCorrelationId } from './correlation';
export { formatLogEntry } from './log-format';
export { sanitizeLogContext } from './log-sanitizer';
export { validateEnvVars } from './env-validation';
