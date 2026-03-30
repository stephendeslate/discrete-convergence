import { randomUUID } from 'crypto';

/**
 * Number of salt rounds for bcryptjs password hashing.
 * VERIFY: AE-SEC-001 — bcrypt salt rounds configuration
 */
export const BCRYPT_SALT_ROUNDS = 12; // TRACED: AE-SEC-001

/**
 * Roles allowed during self-registration. ADMIN is excluded.
 * VERIFY: AE-AUTH-001 — registration role restrictions
 */
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['USER', 'VIEWER'] as const; // TRACED: AE-AUTH-001

/**
 * Maximum page size for paginated queries.
 * VERIFY: AE-DATA-001 — pagination limits
 */
export const MAX_PAGE_SIZE = 100; // TRACED: AE-DATA-001

/**
 * Default page size for paginated queries.
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Application version string.
 */
export const APP_VERSION = '1.0.0';

/**
 * Creates a unique correlation ID for request tracing.
 * VERIFY: AE-MON-001 — correlation ID generation
 */
export function createCorrelationId(): string {
  return randomUUID(); // TRACED: AE-MON-001
}

/**
 * Formats a structured log entry for pino-compatible JSON logging.
 * VERIFY: AE-MON-002 — structured logging format
 */
export function formatLogEntry(level: string, message: string, context?: Record<string, unknown>): Record<string, unknown> {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitizeLogContext(context ?? {}),
  }; // TRACED: AE-MON-002
}

/**
 * Sanitizes log context by removing sensitive fields.
 * VERIFY: AE-SEC-002 — log sanitization
 */
export function sanitizeLogContext(context: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'apikey'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'; // TRACED: AE-SEC-002
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validates that required environment variables are set.
 * Throws an error listing any missing variables.
 * VERIFY: AE-INFRA-001 — environment variable validation
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`); // TRACED: AE-INFRA-001
  }
}
