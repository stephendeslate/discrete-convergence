import { randomUUID } from 'crypto';

/**
 * Number of salt rounds for bcryptjs hashing.
 * TRACED: FD-SEC-001
 */
export const BCRYPT_SALT_ROUNDS = 12;

/**
 * Roles allowed during self-registration.
 * TRACED: FD-AUTH-002
 */
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = [
  'ADMIN',
  'DISPATCHER',
] as const;

/**
 * Maximum page size for paginated queries.
 * TRACED: FD-API-001
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Default page size for paginated queries.
 * TRACED: FD-API-002
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Current application version.
 */
export const APP_VERSION = '1.0.0';

/**
 * Creates a unique correlation ID for request tracing.
 * TRACED: FD-MON-001
 */
export function createCorrelationId(): string {
  return randomUUID();
}

/**
 * Formats a structured log entry for Pino-compatible logging.
 * TRACED: FD-MON-002
 */
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

/**
 * Sanitizes log context by removing sensitive fields.
 * TRACED: FD-SEC-002
 */
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'authorization',
    'cookie',
    'creditCard',
    'ssn',
  ];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validates that required environment variables are set.
 * Throws if any are missing.
 * TRACED: FD-INFRA-001
 */
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
