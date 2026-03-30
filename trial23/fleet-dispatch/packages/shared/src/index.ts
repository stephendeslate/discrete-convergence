// TRACED: FD-CROSS-003 — Shared package with >= 3 consumers per app
import { randomUUID } from 'crypto';

/** Canonical application version */
export const APP_VERSION = '0.1.0';

/** bcryptjs salt rounds — shared between auth service and seed */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles allowed during self-registration (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as const;

/** Maximum page size to prevent over-fetching */
export const MAX_PAGE_SIZE = 100;

/** Default page size when none specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Work order status transitions */
export const WORK_ORDER_STATUSES = [
  'UNASSIGNED',
  'ASSIGNED',
  'EN_ROUTE',
  'ON_SITE',
  'IN_PROGRESS',
  'COMPLETED',
  'INVOICED',
  'PAID',
  'CANCELLED',
] as const;

/** Invoice status transitions */
export const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'VOID'] as const;

/** Generate a correlation ID for request tracing */
export function createCorrelationId(): string {
  return randomUUID();
}

/** Format a structured log entry */
export function formatLogEntry(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
}

/** Remove sensitive fields from log context */
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
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

/** Validate required environment variables at startup */
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/** Clamp pagination parameters to safe bounds */
export function clampPagination(
  page?: number,
  limit?: number,
): { page: number; limit: number; offset: number } {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(limit) || DEFAULT_PAGE_SIZE)),
  );
  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
}

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
