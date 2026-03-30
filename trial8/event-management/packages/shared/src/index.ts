import { randomUUID } from 'crypto';

// TRACED: EM-AUTH-001 — Bcrypt salt rounds constant
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-AUTH-002 — Allowed registration roles (ADMIN excluded)
export const ALLOWED_REGISTRATION_ROLES: readonly string[] = ['USER', 'ORGANIZER'] as const;

// TRACED: EM-PERF-001 — Pagination constants
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: EM-MON-001 — App version
export const APP_VERSION = '1.0.0';

// TRACED: EM-MON-002 — Correlation ID generator
export function createCorrelationId(): string {
  return randomUUID();
}

// TRACED: EM-MON-003 — Structured log entry formatter
export function formatLogEntry(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId?: string;
}): Record<string, unknown> {
  return {
    message: `${data.method} ${data.url} ${data.statusCode}`,
    method: data.method,
    url: data.url,
    statusCode: data.statusCode,
    duration: data.duration,
    correlationId: data.correlationId,
    timestamp: new Date().toISOString(),
  };
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'secret',
  'authorization',
]);

// TRACED: EM-SEC-001 — Log context sanitizer (deep nested + arrays)
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeLogContext(value);
      }
    }
    return result;
  }
  return obj;
}

// TRACED: EM-INFRA-001 — Environment variable validator
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// TRACED: EM-PERF-002 — Pagination clamping (clamp, not reject)
export function clampPagination(page?: number, pageSize?: number): { page: number; pageSize: number; skip: number } {
  const clampedPage = Math.max(1, Math.floor(page || 1));
  const clampedPageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize || DEFAULT_PAGE_SIZE)));
  return {
    page: clampedPage,
    pageSize: clampedPageSize,
    skip: (clampedPage - 1) * clampedPageSize,
  };
}
