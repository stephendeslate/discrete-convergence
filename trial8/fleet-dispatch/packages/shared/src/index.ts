import { randomUUID } from 'crypto';

// Constants
export const BCRYPT_SALT_ROUNDS = 12;
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'DISPATCHER'] as const;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const APP_VERSION = '1.0.0';

// Pagination
export function clampPagination(page?: number, pageSize?: number): { skip: number; take: number; page: number; pageSize: number } {
  const p = Math.max(1, page ?? 1);
  const ps = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
  return { skip: (p - 1) * ps, take: ps, page: p, pageSize: ps };
}

// Correlation ID
export function createCorrelationId(): string {
  return randomUUID();
}

// Logging
export function formatLogEntry(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId?: string;
}): string {
  return JSON.stringify({
    method: data.method,
    url: data.url,
    statusCode: data.statusCode,
    duration: `${data.duration}ms`,
    correlationId: data.correlationId ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}

// Sensitive field keys to redact
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'secret',
  'authorization',
]);

// Sanitize log context - deep nested + array support
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeLogContext(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Environment validation
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
