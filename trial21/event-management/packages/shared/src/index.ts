import { randomUUID } from 'crypto';

/** Number of salt rounds for bcryptjs hashing — TRACED:EM-SEC-001 */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during registration — TRACED:EM-SEC-002 */
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['ATTENDEE'] as const;

/** Maximum page size for paginated queries — TRACED:EM-API-001 */
export const MAX_PAGE_SIZE = 100;

/** Default page size for paginated queries — TRACED:EM-API-002 */
export const DEFAULT_PAGE_SIZE = 20;

/** Current application version — TRACED:EM-INF-001 */
export const APP_VERSION = '1.0.0';

/** Create a unique correlation ID for request tracing — TRACED:EM-MON-001 */
export function createCorrelationId(): string {
  return `em-${randomUUID()}`;
}

/** Format a structured log entry for Pino — TRACED:EM-MON-002 */
export function formatLogEntry(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitizeLogContext(context ?? {}),
  };
}

/** Remove sensitive fields from log context — TRACED:EM-SEC-003 */
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/** Validate that required environment variables are set — TRACED:EM-INF-002 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((v) => {
    const val = process.env[v];
    return val === undefined || val === '';
  });
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
