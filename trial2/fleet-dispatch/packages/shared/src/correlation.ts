import { randomUUID } from 'crypto';

/**
 * Create a unique correlation ID for request tracing.
 * Uses crypto.randomUUID for cryptographically strong uniqueness.
 */
export function createCorrelationId(): string {
  return randomUUID();
}
