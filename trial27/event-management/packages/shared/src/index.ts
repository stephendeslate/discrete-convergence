// TRACED: EM-INFRA-001 — Shared constants and utilities

import { randomUUID } from 'crypto';

// ─── Constants ───────────────────────────────────────────────────────────────

export const APP_VERSION = '0.1.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 10;
export const JWT_EXPIRY = '1h';
export const CORRELATION_HEADER = 'x-correlation-id';
export const HEALTH_CHECK_TIMEOUT = 5000;
export const RATE_LIMIT_TTL = 60000;
export const RATE_LIMIT_MAX = 20000;

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum TenantTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RegistrationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Sanitize a value for safe logging — redacts sensitive fields.
 * TRACED: EM-MON-003
 */
export function sanitizeLogValue(key: string, value: unknown): unknown {
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'authorization', 'cookie'];
  if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
    return '[REDACTED]';
  }
  return value;
}

/**
 * Generate a correlation ID for request tracing.
 * TRACED: EM-MON-002
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Clamp page number to a valid range (minimum 1).
 * TRACED: EM-EDGE-010
 */
export function clampPage(page: unknown): number {
  const num = Number(page);
  if (isNaN(num) || num < 1) return 1;
  return Math.floor(num);
}

/**
 * Clamp page size to a valid range (1 to MAX_PAGE_SIZE).
 * TRACED: EM-EDGE-011
 */
export function clampPageSize(size: unknown): number {
  const num = Number(size);
  if (isNaN(num) || num < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(num), MAX_PAGE_SIZE);
}

/**
 * Validate that required environment variables are set.
 * TRACED: EM-INFRA-003
 */
export function validateEnvVars(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
