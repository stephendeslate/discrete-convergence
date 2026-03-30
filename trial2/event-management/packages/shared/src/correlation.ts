import { randomUUID } from 'crypto';

/**
 * Creates a new correlation ID for request tracing.
 * Uses crypto.randomUUID for uniqueness.
 */
export function createCorrelationId(): string {
  return randomUUID();
}
