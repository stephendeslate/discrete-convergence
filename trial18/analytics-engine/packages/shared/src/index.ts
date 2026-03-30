import { randomUUID } from 'crypto';

// TRACED: AE-CROSS-004 — Shared package exports are consumed by 3+ files in both api and web apps

// Auth constants
export const BCRYPT_SALT_ROUNDS = 12;
export const ALLOWED_REGISTRATION_ROLES = ['VIEWER'] as const;

// Pagination constants
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

// App metadata
export const APP_VERSION = '1.0.0';

/**
 * Generate a UUID v4 correlation ID for request tracking.
 */
export function createCorrelationId(): string {
  return randomUUID();
}

/**
 * Format a structured JSON log entry.
 */
export function formatLogEntry(entry: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId: string;
}): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: `${entry.duration}ms`,
    correlationId: entry.correlationId,
  });
}

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'access_token',
  'secret',
  'authorization',
];

/**
 * Sanitize log context by redacting sensitive fields.
 * Handles nested objects and arrays recursively.
 */
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogContext(value);
      }
    }
    return sanitized;
  }
  return obj;
}

/**
 * Validate required environment variables at startup.
 * Throws if any required variable is missing or empty.
 */
export function validateEnvVars(required: string[]): void {
  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

/**
 * Parse and clamp pagination parameters.
 */
export function parsePagination(query: {
  page?: number;
  pageSize?: number;
}): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}
