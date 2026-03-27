// TRACED: FD-INF-001 — Shared constants and utilities
// TRACED: FD-INF-003 — ESLint 9 flat config in eslint.config.mjs with no-explicit-any error

import { randomUUID } from 'crypto';

// ── Constants ──────────────────────────────────────────────────────────────────

export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 10;
export const JWT_EXPIRY = '1h';
export const CORRELATION_HEADER = 'x-correlation-id';
export const HEALTH_CHECK_TIMEOUT = 5000;
export const RATE_LIMIT_TTL = 60000;
export const RATE_LIMIT_MAX = 20000;

// ── Enums ──────────────────────────────────────────────────────────────────────

export enum TenantTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
}

export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ── Utilities ──────────────────────────────────────────────────────────────────

/**
 * Sanitize a value for safe logging — redacts secrets, tokens, passwords.
 */
export function sanitizeLogValue(key: string, value: unknown): unknown {
  const sensitiveKeys = ['password', 'secret', 'token', 'authorization', 'cookie', 'passwordHash'];
  if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
    return '[REDACTED]';
  }
  return value;
}

/**
 * Generate a v4 correlation ID.
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Clamp page number to a minimum of 1.
 */
export function clampPage(page: number | undefined): number {
  const p = Number(page) || 1;
  return Math.max(1, Math.floor(p));
}

/**
 * Clamp page size between 1 and MAX_PAGE_SIZE.
 */
export function clampPageSize(size: number | undefined): number {
  const s = Number(size) || DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(s)));
}

/**
 * Validate that required environment variables are set.
 * Throws an error listing any missing variables.
 */
export function validateEnvVars(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
