// TRACED: EM-SHARED-001
// TRACED: EM-SHARED-002
// TRACED: EM-SHARED-003

export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'ORGANIZER'] as const;
export type AllowedRegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  context?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
}

export function formatLogEntry(entry: Partial<LogEntry>): LogEntry {
  return {
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    timestamp: entry.timestamp ?? new Date().toISOString(),
    correlationId: entry.correlationId,
    context: entry.context,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: entry.duration,
  };
}

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'access_token',
  'secret',
  'authorization',
  'refreshtoken',
  'refresh_token',
];

export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeLogContext(value);
      }
    }
    return result;
  }
  return obj;
}

export function validateEnvVars(vars: string[]): void {
  const missing: string[] = [];
  for (const v of vars) {
    if (!process.env[v]) {
      missing.push(v);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export function clampPagination(params: { page?: number; limit?: number }): PaginationParams {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE));
  return { page, limit };
}

export function getPaginationSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

export function parsePagination(page?: number, limit?: number): { skip: number; limit: number; page: number } {
  const clamped = clampPagination({ page, limit });
  return { skip: getPaginationSkip(clamped), limit: clamped.limit, page: clamped.page };
}
