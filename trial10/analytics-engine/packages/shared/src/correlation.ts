import { randomUUID } from 'crypto';

/**
 * Creates a unique correlation ID for request tracing.
 * Uses crypto.randomUUID for cryptographically secure IDs.
 */
export function createCorrelationId(): string {
  return randomUUID();
}
